package sse

import (
	"encoding/json"
	"fmt"
	"sync"
)

// Event represents a server-sent event
type Event struct {
	Type string      `json:"type"` // attendance_updated, leave_created, leave_approved, overtime_created, overtime_approved, payroll_updated, project_updated
	Data interface{} `json:"data"`
}

// Client represents a connected SSE client
type Client struct {
	ID     string
	UserID uint
	Role   string
	Send   chan []byte
}

// Hub manages all SSE connections and broadcasts
type Hub struct {
	clients    map[string]*Client
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

// NewHub creates a new SSE hub
func NewHub() *Hub {
	h := &Hub{
		clients:    make(map[string]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
	go h.run()
	return h
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client.ID] = client
			h.mu.Unlock()
		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.ID]; ok {
				close(client.Send)
				delete(h.clients, client.ID)
			}
			h.mu.Unlock()
		}
	}
}

// Register adds a new client
func (h *Hub) Register(client *Client) {
	h.register <- client
}

// Unregister removes a client
func (h *Hub) Unregister(client *Client) {
	h.unregister <- client
}

// Broadcast sends an event to all connected clients
func (h *Hub) Broadcast(event Event) {
	data, err := json.Marshal(event)
	if err != nil {
		return
	}
	msg := fmt.Sprintf("event: %s\ndata: %s\n\n", event.Type, string(data))

	h.mu.RLock()
	defer h.mu.RUnlock()
	for _, client := range h.clients {
		select {
		case client.Send <- []byte(msg):
		default:
			// Client buffer full, skip
		}
	}
}

// BroadcastToRoles sends an event only to clients with specific roles
func (h *Hub) BroadcastToRoles(event Event, roles ...string) {
	data, err := json.Marshal(event)
	if err != nil {
		return
	}
	msg := fmt.Sprintf("event: %s\ndata: %s\n\n", event.Type, string(data))
	roleSet := make(map[string]bool)
	for _, r := range roles {
		roleSet[r] = true
	}

	h.mu.RLock()
	defer h.mu.RUnlock()
	for _, client := range h.clients {
		if roleSet[client.Role] {
			select {
			case client.Send <- []byte(msg):
			default:
			}
		}
	}
}

// ClientCount returns the number of connected clients
func (h *Hub) ClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}
