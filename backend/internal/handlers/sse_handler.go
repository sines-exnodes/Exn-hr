package handlers

import (
	"fmt"
	"io"
	"time"

	"github.com/exn-hr/backend/internal/sse"
	"github.com/gin-gonic/gin"
)

type SSEHandler struct {
	hub *sse.Hub
}

func NewSSEHandler(hub *sse.Hub) *SSEHandler {
	return &SSEHandler{hub: hub}
}

// Stream handles GET /api/v1/events — SSE endpoint for real-time updates
func (h *SSEHandler) Stream(c *gin.Context) {
	userID := c.GetUint("user_id")
	role, _ := c.Get("role")
	roleStr, _ := role.(string)

	client := &sse.Client{
		ID:     fmt.Sprintf("%d-%d", userID, time.Now().UnixNano()),
		UserID: userID,
		Role:   roleStr,
		Send:   make(chan []byte, 256),
	}

	h.hub.Register(client)
	defer h.hub.Unregister(client)

	// Set SSE headers
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("X-Accel-Buffering", "no") // Disable nginx buffering
	c.Writer.Flush()

	// Send initial connection event
	fmt.Fprintf(c.Writer, "event: connected\ndata: {\"client_id\":\"%s\"}\n\n", client.ID)
	c.Writer.Flush()

	// Keep-alive ticker (send comment every 30s to keep connection alive)
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	clientGone := c.Request.Context().Done()

	for {
		select {
		case <-clientGone:
			return
		case msg, ok := <-client.Send:
			if !ok {
				return
			}
			_, err := c.Writer.Write(msg)
			if err != nil {
				return
			}
			c.Writer.Flush()
		case <-ticker.C:
			_, err := io.WriteString(c.Writer, ": keepalive\n\n")
			if err != nil {
				return
			}
			c.Writer.Flush()
		}
	}
}
