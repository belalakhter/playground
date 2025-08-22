package main

import(
	"sync"
	"fmt"
	"os"
	"net"
	"bufio"
	"strconv"
	"strings"
	"math"
	"math/rand"
	"time"
)
type Evictor struct {
	mu   sync.Mutex
	data map[string]*LFUCounter
	cap  int
}

type TcpServer struct {
	clients map[int]bool
	mu      sync.Mutex
	listener net.Listener
	store map[string]string
	evictor  *Evictor
	capacity int
}
type LFUCounter struct {
	C int
}

func main() {
	server := NewServer()
	server.StartServer()
}


func NewServer() *TcpServer {
	Listener, err := net.Listen("tcp", ":6379")
	if err != nil {
		fmt.Println("Error starting server:", err)
		os.Exit(1)
	}
	server := &TcpServer{
		clients:  make(map[int]bool),
		listener: Listener,
		store:    make(map[string]string),
		evictor:  NewEvictor(1000),
		capacity: 1000,
	}
    return server
}
func (server *TcpServer) StartServer(){
	fmt.Println("Server listening on port 8989...")
		clientID := 0
		for {
			conn, err := server.listener.Accept()
			if err != nil {
				fmt.Println("Error accepting connection:", err)
				continue
			}
			clientID++
			id := clientID

			server.mu.Lock()
			server.clients[id] = true
			server.mu.Unlock()

			fmt.Println("New client connected:", id)

			go func(c net.Conn, cid int) {
				defer c.Close()
              defer func() {
              server.mu.Lock()
               delete(server.clients, cid)
               server.mu.Unlock()
               fmt.Println("Client disconnected:", cid)
                }()
				reader := bufio.NewReader(conn)
				writer := bufio.NewWriter(conn)
				for {
						line, err := reader.ReadString('\n')
						if err != nil {
							return
						}
						line = strings.TrimSpace(line)
						if line == "" {
							continue
						}
						parts := strings.Split(line, " ")
						cmd := strings.ToUpper(parts[0])

						switch cmd {
						case "SET":
							if len(parts) != 3 {
								writer.WriteString("-ERR wrong args\r\n")
								continue
							}
							key, val := parts[1], parts[2]

							if len(server.store) >= server.capacity {
								lfu := server.evictor.FindLFUKey()
								delete(server.store, lfu)
								server.evictor.Remove(lfu)
							}

							server.store[key] = val
							server.evictor.Add(key)
							writer.WriteString("+OK\r\n")

						case "GET":
							if len(parts) != 2 {
								writer.WriteString("-ERR wrong args\r\n")
								continue
							}
							key := parts[1]
							val, ok := server.store[key]
							if !ok {
								writer.WriteString("$-1\r\n")
							} else {
								server.evictor.Touch(key)
								writer.WriteString("$" + strconv.Itoa(len(val)) + "\r\n" + val + "\r\n")
							}

						default:
							writer.WriteString("-ERR unknown command\r\n")
						}
						writer.Flush()
				}
			}(conn, id)
		}
}

func (c *LFUCounter) Increment() {
	p := 1.0 / math.Pow(2, float64(c.C))
	if rand.Float64() < p {
		c.C++
	}
}

func (c *LFUCounter) Estimate() int {
	return int(math.Pow(2, float64(c.C)) - 1)
}



func NewEvictor(cap int) *Evictor {
	rand.Seed(time.Now().UnixNano())
	return &Evictor{
		data: make(map[string]*LFUCounter),
		cap:  cap,
	}
}

func (e *Evictor) Touch(key string) {
	e.mu.Lock()
	defer e.mu.Unlock()
	if c, ok := e.data[key]; ok {
		c.Increment()
	}
}

func (e *Evictor) Add(key string) {
	e.mu.Lock()
	defer e.mu.Unlock()
	e.data[key] = &LFUCounter{C: 0}
}

func (e *Evictor) Remove(key string) {
	e.mu.Lock()
	defer e.mu.Unlock()
	delete(e.data, key)
}

func (e *Evictor) FindLFUKey() string {
	e.mu.Lock()
	defer e.mu.Unlock()

	minKey := ""
	minCount := int(^uint(0) >> 1)
	for k, c := range e.data {
		if c.Estimate() < minCount {
			minCount = c.Estimate()
			minKey = k
		}
	}
	return minKey
}


func ParseRESP(reader *bufio.Reader) ([]string, error) {
	line, err := reader.ReadString('\n')
	if err != nil {
		return nil, err
	}
	line = strings.TrimSpace(line)

	if !strings.HasPrefix(line, "*") {
		return nil, fmt.Errorf("expected array, got: %s", line)
	}
	n, err := strconv.Atoi(line[1:])
	if err != nil {
		return nil, err
	}

	parts := make([]string, 0, n)
	for i := 0; i < n; i++ {
		_, err := reader.ReadString('\n')
		if err != nil {
			return nil, err
		}
		val, err := reader.ReadString('\n')
		if err != nil {
			return nil, err
		}
		parts = append(parts, strings.TrimSpace(val))
	}
	return parts, nil
}


func WriteRESP(writer *bufio.Writer, resp string, kind string) error {
	var out string
	switch kind {
	case "simple":
		out = "+" + resp + "\r\n"
	case "bulk":
		out = "$" + strconv.Itoa(len(resp)) + "\r\n" + resp + "\r\n"
	case "nil":
		out = "$-1\r\n"
	case "error":
		out = "-" + resp + "\r\n"
	default:
		out = "+" + resp + "\r\n"
	}
	_, err := writer.WriteString(out)
	if err != nil {
		return err
	}
	return writer.Flush()
}
