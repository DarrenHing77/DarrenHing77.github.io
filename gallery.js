// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM Content Loaded - Initializing Gallery");
    
    // Give the browser a moment to fully render the page before initializing
    setTimeout(initializeGallery, 100);
    
    function initializeGallery() {
        const gallery = document.getElementById("gallery");
        
        // Ensure gallery element exists
        if (!gallery) {
            console.error("Gallery element not found! Make sure the element with id 'gallery' exists.");
            return;
        }
        
        console.log("Gallery dimensions:", gallery.clientWidth, "x", gallery.clientHeight);
        
        // Verify the gallery has dimensions
        if (gallery.clientWidth <= 0 || gallery.clientHeight <= 0) {
            console.error("Gallery has no dimensions. Check CSS and layout.");
            // Force a minimum size if needed
            gallery.style.minHeight = "400px";
            gallery.style.minWidth = "400px";
        }
        
        const nodes = [];
        const connections = [];
        const nodeSize = 140; // Size of each node in pixels
        const spacing = nodeSize * 1.3; // Minimum distance between nodes
        
        // List of images to display
        const images = [
            "media/orcKing01.jpg", 
            "media/P_Rick01.jpg", 
            "media/The-Smeds-and-the-Smoos.jpeg", 
            "media/zog01.jpg",
            "media/Carnage_Wlde_Eevee.jpg", 
            "media/HighwayRat01.jpg", 
            "media/Nazgul_Full_v002.jpg", 
            "media/Revolting-Rhymes-Wolf.jpg", 
            "media/SpaceMarines_UE.jpeg", 
            "media/StickMan_Sc&S_h1.jpg"
        ];
        
        // Check if nodes would overlap
        function isOverlapping(newX, newY) {
            return nodes.some(node => {
                const dx = node.x - newX;
                const dy = node.y - newY;
                return Math.sqrt(dx * dx + dy * dy) < spacing;
            });
        }
        
        // Create a node with an image
        function createNode(image) {
            const maxWidth = gallery.clientWidth - nodeSize;
            const maxHeight = gallery.clientHeight - nodeSize;
            
            if (maxWidth <= 0 || maxHeight <= 0) {
                console.error("Gallery area too small for nodes", maxWidth, maxHeight);
                return null;
            }
            
            // Try to find a position that doesn't overlap
            let x, y, attempts = 0;
            do {
                x = Math.random() * maxWidth;
                y = Math.random() * maxHeight;
                attempts++;
                
                // Break after too many attempts
                if (attempts >= 50) {
                    console.log("Couldn't find non-overlapping position after 50 attempts");
                    break;
                }
            } while (isOverlapping(x, y));
            
            // Create the node element
            const node = document.createElement("div");
            node.classList.add("node");
            node.style.left = `${x}px`;
            node.style.top = `${y}px`;
            
            // Add the image
            const img = document.createElement("img");
            img.src = image;
            img.alt = "Gallery artwork";
            img.onerror = () => {
                console.warn(`Failed to load image: ${image}`);
                // Use a fallback color instead of loading a placeholder
                node.style.backgroundColor = "#1e90ff";
            };
            
            node.appendChild(img);
            gallery.appendChild(node);
            
            // Store the node data
            const nodeData = { element: node, x, y, connections: [] };
            nodes.push(nodeData);
            
            console.log(`Node created at (${x.toFixed(0)}, ${y.toFixed(0)})`);
            return nodeData;
        }
        
        // Create a connection between two nodes
        function createConnection(nodeA, nodeB) {
            if (!nodeA || !nodeB) return null;
            
            const line = document.createElement("div");
            line.classList.add("line");
            gallery.insertBefore(line, gallery.firstChild);
            
            const connection = { element: line, nodeA, nodeB };
            connections.push(connection);
            
            // Store connection references in nodes
            nodeA.connections.push(connection);
            nodeB.connections.push(connection);
            
            updateConnection(connection);
            return connection;
        }
        
        // Update a connection's position and rotation
        function updateConnection(connection) {
            const { element, nodeA, nodeB } = connection;
            
            // Get current positions
            const x1 = parseInt(nodeA.element.style.left) + nodeSize / 2;
            const y1 = parseInt(nodeA.element.style.top) + nodeSize / 2;
            const x2 = parseInt(nodeB.element.style.left) + nodeSize / 2;
            const y2 = parseInt(nodeB.element.style.top) + nodeSize / 2;
            
            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            // Update line
            element.style.width = `${length}px`;
            element.style.left = `${x1}px`;
            element.style.top = `${y1}px`;
            element.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
        }
        
        // Update all connections
        function updateAllConnections() {
            connections.forEach(updateConnection);
        }
        
        // Highlight connections for a node
        function highlightConnections(node) {
            // Highlight the node itself
            node.element.classList.add("active");
            
            // Highlight connections and connected nodes
            node.connections.forEach(conn => {
                conn.element.style.background = "linear-gradient(to right, #1e90ff, white)";
                conn.element.style.height = "3px";
                conn.element.style.opacity = "1";
                
                // Also highlight connected node
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
        
        // Reset all highlights
        function resetConnectionHighlights() {
            nodes.forEach(node => {
                node.element.classList.remove("active");
                node.element.classList.remove("connected");
            });
            
            connections.forEach(conn => {
                conn.element.style.background = "linear-gradient(to right, white, blue)";
                conn.element.style.height = "2px";
                conn.element.style.opacity = "1";
            });
        }
        
        // Create all the nodes
        console.log(`Creating ${images.length} nodes...`);
        const createdNodes = [];
        
        for (const image of images) {
            const node = createNode(image);
            if (node) createdNodes.push(node);
        }
        
        console.log(`Created ${createdNodes.length} nodes successfully`);
        
        // Connect each node to its closest neighbors
        createdNodes.forEach(nodeA => {
            // Find 2 closest nodes
            const closest = createdNodes
                .filter(nodeB => nodeB !== nodeA)
                .map(nodeB => ({
                    nodeB,
                    dist: Math.hypot(nodeB.x - nodeA.x, nodeB.y - nodeA.y)
                }))
                .sort((a, b) => a.dist - b.dist)
                .slice(0, 2);
            
            // Create connections
            closest.forEach(({ nodeB }) => {
                createConnection(nodeA, nodeB);
            });
        });
        
        console.log(`Created ${connections.length} connections`);
        
        // Add hover events to nodes
        nodes.forEach(node => {
            node.element.addEventListener("mouseenter", () => {
                highlightConnections(node);
            });
            
            node.element.addEventListener("mouseleave", () => {
                resetConnectionHighlights();
            });
        });
        
        // Handle window resize
        let resizeTimer;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                updateAllConnections();
            }, 250);
        });
    }
});
