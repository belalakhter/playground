package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync/atomic"
)

type Templates struct {
	templates *template.Template
}
type Candidate struct {
	ID       int
	Name     string
	Position string
	Count    int
}

var (
	candidates []Candidate
	nextID     = 1
	atomicBool atomic.Int32
)

func main() {
	tmpl := template.Must(template.ParseGlob("views/*.html"))
	t := &Templates{templates: tmpl}
	http.HandleFunc("/", t.handleIndex)
	fs := http.FileServer(http.Dir("views"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	http.HandleFunc("/modal", func(w http.ResponseWriter, r *http.Request) {
		tmpl := template.Must(template.ParseFiles("views/form.html"))
		tmpl.Execute(w, nil)
	})
	http.HandleFunc("/add-candidate", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		name := r.FormValue("name")
		position := r.FormValue("position")

		password := r.FormValue("password")
		if password != "admin" {
			http.Error(w, "Wrong Password", http.StatusBadRequest)
			return
		}

		if name == "" || position == "" {
			http.Error(w, "Missing name or position", http.StatusBadRequest)
			return
		}

		candidate := Candidate{
			ID:       nextID,
			Name:     name,
			Position: position,
			Count:    0,
		}
		nextID++
		candidates = append(candidates, candidate)

		tmpl := template.Must(template.ParseFiles("views/card.html"))
		tmpl.Execute(w, candidate)
	})
	http.HandleFunc("/vote/", func(w http.ResponseWriter, r *http.Request) {
		idStr := strings.TrimPrefix(r.URL.Path, "/vote/")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		if atomicBool.Load() != 1 {
			atomicBool.Store(1)
			for i := range candidates {
				if candidates[i].ID == id {
					candidates[i].Count++
					fmt.Fprintf(w, `<p id="count-%d" class="card-count">Count: %d</p>`, id, candidates[i].Count)
					return
				} else {
					http.Error(w, "Candidate not found", http.StatusNotFound)
				}
			}

		} else {
			http.Error(w, "Voted Already", http.StatusBadRequest)
		}
	})

	fmt.Printf("Server started on http://localhost:8080\n")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}

func (t *Templates) handleIndex(w http.ResponseWriter, r *http.Request) {
	err := t.templates.ExecuteTemplate(w, "index.html", candidates)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
