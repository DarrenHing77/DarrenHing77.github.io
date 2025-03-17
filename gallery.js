document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.getElementById("gallery");
    const nodes = [];
    const connections = [];
    const nodeSize = 140;
    const spacing = nodeSize * 1.5;
    const images = [
        "media/orcKing01.jpg", "media/P_Rick01.jpg", "media/The-Smeds-and-the-Smoos.jpeg", "media/zog01.jpg",
        "media/Carnage_Wlde_Eevee.jpg", "media/HighwayRat01.jpg", "media/Nazgul_Full_v002.jpg", 
        "media/Revolting-Rhymes-Wolf.jpg", "media/SpaceMarines_UE.jpeg", "media/StickMan_Sc&S_h1.jpg"
    ];

    // Ensure gallery has proper dimensions for node placement
    function setupGalleryDimensions() {
        // Wait for layout to be properly calculated
        setTimeout(() => {
            if (!gallery.clientWidth || !gallery.clientHeight) {
                console.error("Gallery container dimensions are not set properly");
            }
        }, 100);
    }

    function isOverlapping(newX, newY) {
        return nodes.some(node => {
            const dx = node.x - newX;
            const dy = node.y - newY;
            return Math.sqrt(dx * dx + dy * dy) < spacing;
        });
    }

    function createNode(image) {
        let x, y, attempts = 0;
        const maxAttempts = 50;
        
        // Make sure we have valid dimensions
        if (!gallery.clientWidth || !gallery.clientHeight) {
            setupGalleryDimensions();
            return null;
        }
        
        const maxWidth = gallery.clientWidth - nodeSize;
        const maxHeight = gallery.clientHeight - nodeSize;
        
        if (maxWidth <= 0 || maxHeight <= 0) {
            console.error("Gallery container has invalid dimensions");
            return null;
        }

        // Try to find a non-overlapping position
        do {
            x = Math.random() * maxWidth;
            y = Math.random() * maxHeight;
            attempts++;
        } while (isOverlapping(x, y) && attempts < maxAttempts);

        // If we couldn't find a good spot after max attempts, just place it
        if (attempts >= maxAttempts) {
            console.log("Couldn't find non-overlapping position after " + maxAttempts + " attempts");
        }

        const node = document.createElement("div");
        node.classList.add("node");
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        
        const img = document.createElement("img");
        img.src = image;
        img.alt = "Gallery artwork"; // For accessibility
        
        // Add loading and error handling
        img.loading = "lazy";
        img.onerror = () => {
            console.error(`Failed to load image: ${image}`);
            img.src = "media/placeholder.jpg"; // Use a placeholder if available
        };
        
        node.appendChild(img);
        gallery.appendChild(node);
        
        // Store node position data
        const nodeData = { element: node, x, y, connections: [] };
        nodes.push(nodeData);
        
        // Add hover effects to highlight connections
        node.addEventListener("mouseenter", () => highlightConnections(nodeData));
        node.addEventListener("mouseleave", resetConnectionHighlights);
        
        return nodeData;
    }

    function createConnection(nodeA, nodeB) {
        if (!nodeA || !nodeB) return;
        
        const line = document.createElement("div");
        line.classList.add("line");
        gallery.insertBefore(line, gallery.firstChild); // Add lines below nodes
        
        const connection = { element: line, nodeA, nodeB };
        connections.push(connection);
        
        // Store connection references in nodes for easy access
        nodeA.connections.push(connection);
        nodeB.connections.push(connection);
        
        return connection;
    }

    function updateConnection(connection) {
        const { element, nodeA, nodeB } = connection;
        
        // Get current positions from DOM (in case nodes moved)
        const x1 = nodeA.element.offsetLeft + nodeSize / 2;
        const y1 = nodeA.element.offsetTop + nodeSize / 2;
        const x2 = nodeB.element.offsetLeft + nodeSize / 2;
        const y2 = nodeB.element.offsetTop + nodeSize / 2;
        
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        // Update line position and rotation
        element.style.width = `${length}px`;
        element.style.left = `${x1}px`;
        element.style.top = `${y1}px`;
        element.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
    }

    function updateAllConnections() {
        // Update all connection lines
        connections.forEach(updateConnection);
    }

    function highlightConnections(node) {
        // Enhance the node's appearance
        node.element.classList.add("active");
        
        // Highlight all connections for this node
        node.connections.forEach(conn => {
            conn.element.style.background = "linear-gradient(to right, #1e90ff, white)";
            conn.element.style.height = "3px";
            conn.element.style.opacity = "1";
            
            // Also highlight connected nodes
            const otherNode = conn.nodeA === node ? conn.nodeB : conn.nodeA;
            otherNode.element.classList.add("connected");
        });
        
        // Fade other connections
        connections.forEach(conn => {
            if (!node.connections.includes(conn)) {
                conn.element.style.opacity = "0.3";
            }
        });
    }

    function resetConnectionHighlights() {
        // Reset all nodes
        nodes.forEach(node => {
            node.element.classList.remove("active");
            node.element.classList.remove("connected");
        });
        
        // Reset all connections
        connections.forEach(conn => {
            conn.element.style.background = "linear-gradient(to right, white, blue)";
            conn.element.style.height = "2px";
            conn.element.style.opacity = "1";
        });
    }

    // Initialize the gallery
    function initGallery() {
        setupGalleryDimensions();
        
        // Create all image nodes
        const createdNodes = images.map(img => createNode(img)).filter(Boolean);
        
        // Connect each node to its closest neighbors
        createdNodes.forEach(nodeA => {
            if (!nodeA) return;
            
            // Find 2 closest nodes
            const closest = createdNodes
                .filter(nodeB => nodeA !== nodeB)
                .map(nodeB => ({
                    nodeB,
                    dist: Math.hypot(nodeB.x - nodeA.x, nodeB.y - nodeA.y)
                }))
                .sort((a, b) => a.dist - b.dist)
                .slice(0, 2);
                
            // Create connections
            closest.forEach(({ nodeB }) => createConnection(nodeA, nodeB));
        });
        
        // Initial render of all connections
        updateAllConnections();
    }
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateAllConnections();
        }, 250);
    });
    
    // Add optional mouse interaction for nodes
    let draggedNode = null;
    
    function enableNodeDragging() {
        nodes.forEach(node => {
            const elem = node.element;
            
            elem.addEventListener("mousedown", (e) => {
                draggedNode = node;
                elem.style.cursor = "grabbing";
                
                // Prevent image dragging
                e.preventDefault();
            });
        });
        
        document.addEventListener("mousemove", (e) => {
            if (draggedNode) {
                const galleryRect = gallery.getBoundingClientRect();
                
                // Calculate new position within gallery bounds
                let newX = e.clientX - galleryRect.left - nodeSize / 2;
                let newY = e.clientY - galleryRect.top - nodeSize / 2;
                
                // Keep within bounds
                newX = Math.max(0, Math.min(gallery.clientWidth - nodeSize, newX));
                newY = Math.max(0, Math.min(gallery.clientHeight - nodeSize, newY));
                
                // Update node position
                draggedNode.element.style.left = `${newX}px`;
                draggedNode.element.style.top = `${newY}px`;
                
                // Update all affected connections
                draggedNode.connections.forEach(updateConnection);
            }
        });
        
        document.addEventListener("mouseup", () => {
            if (draggedNode) {
                draggedNode.element.style.cursor = "pointer";
                draggedNode = null;
            }
        });
    }
    
    // Initialize gallery
    initGallery();
    
    // Optional: Enable dragging nodes (uncomment to enable)
    // enableNodeDragging();
});
