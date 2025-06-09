package main

type Node struct {
	node  int
	left  *Node
	right *Node
}

func insert(root *Node, value int) *Node {
	if root == nil {
		return &Node{node: value}
	}
	if value < root.node {
		root.left = insert(root.left, value)
	} else {
		root.right = insert(root.right, value)
	}
	return root
}

func search(root *Node, value int) (*Node, *Node) {
	if root == nil || root.node == value {
		return root, nil
	}

	var node, parent *Node
	if root.node > value {
		node, parent = search(root.left, value)
	} else {
		node, parent = search(root.right, value)
	}
	if node != nil && parent == nil {
		return node, root
	}
	return node, parent
}

func hieght(node *Node) int {
	if node == nil {
		return 0
	}
	leftHeight := hieght(node.left)
	rightHeight := hieght(node.right)
	if leftHeight > rightHeight {
		return leftHeight + 1
	}
	return rightHeight + 1
}

func BF(node *Node) int {
	if node == nil {
		return 0
	}
	leftHeight := hieght(node.left)
	rightHeight := hieght(node.right)
	return leftHeight - rightHeight
}
