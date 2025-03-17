document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM Content Loaded - Initializing Gallery");
    
    // Critical fix: Wait a bit longer for layout calculations to complete
    setTimeout(initializeGallery, 300);
    
    function initializeGallery() {
        const gallery = document.getElementById("gallery");
        
        // Ensure gallery element exists
        if (!gallery) {
            console.error("Gallery element not found! Make sure the element with id 'gallery' exists.");
            return;
        }
        
        // CRITICAL FIX: Force the gallery to have height if it doesn't
        if (gallery.clientHeight < 10) {
            console.warn("Gallery has no height - forcing minimum height");
            gallery.style.height = "500px";
            gallery.style.minHeight = "500px";
            // Force a reflow
            void gallery.offsetHeight;
        }
        
        console.log("Gallery dimensions:", gallery.clientWidth, "x", gallery.clientHeight);
        
        const nodes = [];
        const connections = [];
        const nodeSize = 140;
        const spacing = nodeSize * 1.3;
        
        // List of images to display - FIXED IMAGE PATHS
        const images = [
            "https://darrenhing77.github.io/media/orcKing01.jpg", 
            "https://darrenhing77.github.io/media/P_Rick01.jpg", 
            "https://darrenhing77.github.io/media/The-Smeds-and-the-Smoos.jpeg", 
            "https://darrenhing77.github.io/media/zog01.jpg",
            "https://darrenhing77.github.io/media/Carnage_Wlde_Eevee.jpg", 
            "https://darrenhing77.github.io/media/HighwayRat01.jpg", 
            "https://darrenhing77.github.io/media/Nazgul_Full_v002.jpg", 
            "https://darrenhing77.github.io/media/Revolting-Rhymes-Wolf.jpg", 
            "https://darrenhing77.github.io/media/SpaceMarines_UE.jpeg", 
            "https://darrenhing77.github.io/media/StickMan_Sc&S_h1.jpg"
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
            // CRITICAL FIX: Ensure gallery has dimensions before calculating
            if (gallery.clientWidth <= 0 || gallery.clientHeight <= 0) {
                console.error("Gallery still has no dimensions!");
                gallery.style.height = "500px";
                gallery.style.minHeight = "500px";
                // Force reflow
                void gallery.offsetHeight;
            }
            
            const maxWidth = Math.max(gallery.clientWidth - nodeSize, 300);
            const maxHeight = Math.max(gallery.clientHeight - nodeSize, 300);
            
            // Try to find a position that doesn't overlap
            let x, y, attempts = 0;
            do {
                x = Math.random() * maxWidth;
                y = Math.random() * maxHeight;
                attempts++;
                
                // Break after too many attempts
                if (attempts >= 50) {
                    console.log("Couldn't find non-overlapping position after 50 attempts - using last attempt");
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
            
            // Handle image error
            img.onerror = () => {
                console.warn(`Failed to load image: ${image}`);
                node.classList.add("image-error");
                node.removeChild(img);
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
        
        // CRITICAL FIX: Create nodes and force gallery reflow
        console.log(`Creating ${images.length} nodes...`);
        const createdNodes = [];
        
        // Force gallery to be visible and have dimensions
        gallery.style.display = "block";
        
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
                node.element.classList.add("active");
                node.connections.forEach(conn => {
                    conn.element.style.height = "3px";
                    conn.element.style.opacity = "1";
                    const otherNode = conn.nodeA === node ? conn.nodeB : conn.nodeA;
                    otherNode.element.classList.add("connected");
                });
            });
            
            node.element.addEventListener("mouseleave", () => {
                node.element.classList.remove("active");
                node.connections.forEach(conn => {
                    conn.element.style.height = "2px";
                    const otherNode = conn.nodeA === node ? conn.nodeB : conn.nodeA;
                    otherNode.element.classList.remove("connected");
                });
            });
        });
    }
});
