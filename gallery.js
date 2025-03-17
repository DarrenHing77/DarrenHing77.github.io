<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Darren Hing Design</title>
    <style>
        /* Body styles */
        body {
            background-color: black;
            color: white;
            margin: 0;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            overflow-x: hidden;
            cursor: default;
        }

        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background: black;
            position: fixed;
            width: 100%;
            top: 0;
            z-index: 1000;
            box-sizing: border-box;
        }

        /* Navigation */
        .menu {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }

        .menu a {
            color: white;
            text-decoration: none;
            font-size: 18px;
            white-space: nowrap;
        }

        .dropdown {
            position: relative;
            display: inline-block;
        }

        .dropdown-content {
            display: none;
            position: absolute;
            background-color: black;
            min-width: 160px;
            box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
            z-index: 1;
        }

        .dropdown:hover .dropdown-content {
            display: block;
        }

        .dropdown-content a {
            color: white;
            padding: 12px 16px;
            display: block;
            text-decoration: none;
        }

        /* Container - Full height */
        .container {
            display: flex;
            justify-content: space-between;
            margin-top: 80px; /* Space for fixed header */
            padding: 0 20px 20px;
            box-sizing: border-box;
            flex: 1; /* Fill available space */
            min-height: calc(100vh - 80px); /* Minimum height after header */
        }

        /* Bio Section */
        .bio {
            width: 30%;
            padding: 20px;
            color: #1e90ff;
            box-sizing: border-box;
        }

        .bio a {
            color: orange;
        }

        /* Gallery - Full height */
        .gallery-container {
            flex: 1;
            position: relative;
            overflow: hidden;
            user-select: none;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-sizing: border-box;
            min-height: calc(100vh - 80px); /* Take full viewport minus header */
        }

        /* Connections */
        .line {
            position: absolute;
            height: 2px;
            background: linear-gradient(to right, white, blue);
            transform-origin: top left;
            z-index: 0;
            transition: opacity 0.3s ease, height 0.3s ease, background 0.3s ease;
        }

        /* Circles */
        .node {
            position: absolute;
            width: 140px;
            height: 140px;
            background: rgba(255, 255, 255, 0.2);
            border: 3px solid white;
            border-radius: 50%;
            transition: transform 0.3s ease, border-color 0.3s ease;
            cursor: pointer;
            z-index: 1;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
        }

        .node:hover, .node.active {
            transform: scale(1.1);
            border-color: #1e90ff;
            z-index: 2;
        }

        .node.connected {
            border-color: #1e90ff;
        }

        /* Images Inside Circles */
        .node img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
            display: block;
        }

        /* Error node style */
        .node.image-error {
            background-color: #1e90ff;
        }

        /* Show class for dropdown menu */
        .dropdown-content.show {
            display: block;
        }

        /* Responsive styles */
        @media (max-width: 768px) {
            .container {
                flex-direction: column;
            }
            
            .bio {
                width: 100%;
                height: auto;
            }
            
            .gallery-container {
                min-height: 70vh;
            }
            
            .node {
                width: 100px;
                height: 100px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Darren Hing Design</h1>
        <nav class="menu">
            <a href="index.html">Home</a>
            <div class="dropdown">
                <a href="#">Portfolio ▼</a>
                <div class="dropdown-content">
                    <a href="personal-work.html">Personal Work</a>
                    <a href="technical.html">Technical</a>
                    <a href="reels.html">Reels</a>
                </div>
            </div>
            <a href="blog.html">Blog</a>
            <a href="contact.html">Contact</a>
        </nav>
    </div>
    
    <div class="container">
        <div class="bio">
            <h2>Lookdev Artist<br>Lighting Artist<br>Illustrator</h2>
            <p>
                Hey there! I'm Darren Hing—artist, toolmaker, and professional button masher. By day, I wrangle nodes and shaders in the film industry... and by night? I swap the techy hat for a sketchpad, conjuring up characters and the worlds they live in. 
                With over a decade in feature animation, I build cool things, break them, then build them better. 
                I'll try to keep this space updated—no promises. Check out my reels <a href="reels.html">here</a>.
            </p>
        </div>
        <div class="gallery-container" id="gallery"></div>
    </div>
    
    <script>
        // Dropdown menu functionality
        document.addEventListener("DOMContentLoaded", function () {
            document.querySelectorAll(".dropdown").forEach(dropdown => {
                dropdown.addEventListener("click", function (event) {
                    event.stopPropagation();
                    this.querySelector(".dropdown-content").classList.toggle("show");
                });
            });
            window.addEventListener("click", function () {
                document.querySelectorAll(".dropdown-content").forEach(menu => {
                    menu.classList.remove("show");
                });
            });
        });
    </script>
    
    <script>
        // Gallery functionality
        document.addEventListener("DOMContentLoaded", function() {
            console.log("DOM Content Loaded - Initializing Gallery");
            
            // Wait for layout to complete
            setTimeout(initializeGallery, 300);
            
            function initializeGallery() {
                const gallery = document.getElementById("gallery");
                
                if (!gallery) {
                    console.error("Gallery element not found!");
                    return;
                }
                
                console.log("Gallery dimensions:", gallery.clientWidth, "x", gallery.clientHeight);
                
                const nodes = [];
                const connections = [];
                const nodeSize = 140;
                const spacing = nodeSize * 1.2; // Minimum distance between node centers
                const NUM_NODES = 12; // Always create exactly 12 nodes
                
                // Set up fallback colors for when images fail to load
                const fallbackColors = [
                    "#ff69b4", "#9370db", "#00ced1", "#32cd32", "#1e90ff", 
                    "#ff7f50", "#9932cc", "#ffd700", "#00ff7f", "#ff4500",
                    "#4169e1", "#8a2be2"
                ];
                
                // Image paths with fallbacks - ensure we have exactly 12
                const images = [
                    { path: "media/orcKing01.jpg", fallback: "https://darrenhing77.github.io/media/orcKing01.jpg" },
                    { path: "media/P_Rick01.jpg", fallback: "https://darrenhing77.github.io/media/P_Rick01.jpg" },
                    { path: "media/The-Smeds-and-the-Smoos.jpeg", fallback: "https://darrenhing77.github.io/media/The-Smeds-and-the-Smoos.jpeg" },
                    { path: "media/zog01.jpg", fallback: "https://darrenhing77.github.io/media/zog01.jpg" },
                    { path: "media/Carnage_Wlde_Eevee.jpg", fallback: "https://darrenhing77.github.io/media/Carnage_Wlde_Eevee.jpg" },
                    { path: "media/HighwayRat01.jpg", fallback: "https://darrenhing77.github.io/media/HighwayRat01.jpg" },
                    { path: "media/Nazgul_Full_v002.jpg", fallback: "https://darrenhing77.github.io/media/Nazgul_Full_v002.jpg" },
                    { path: "media/Revolting-Rhymes-Wolf.jpg", fallback: "https://darrenhing77.github.io/media/Revolting-Rhymes-Wolf.jpg" },
                    { path: "media/SpaceMarines_UE.jpeg", fallback: "https://darrenhing77.github.io/media/SpaceMarines_UE.jpeg" },
                    { path: "media/StickMan_Sc&S_h1.jpg", fallback: "https://darrenhing77.github.io/media/StickMan_Sc&S_h1.jpg" },
                    // Add two more to ensure we always have 12
                    { path: "media/placeholder1.jpg", fallback: null },
                    { path: "media/placeholder2.jpg", fallback: null }
                ];
                
                function isOverlapping(newX, newY) {
                    return nodes.some(node => {
                        const dx = node.x - newX;
                        const dy = node.y - newY;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        return distance < spacing;
                    });
                }
                
                // Improved node placement algorithm that ensures no overlaps
                function placeNodesWithoutOverlap() {
                    const maxWidth = gallery.clientWidth - nodeSize;
                    const maxHeight = gallery.clientHeight - nodeSize;
                    
                    // Calculate how many nodes to place on each axis for even distribution
                    // Using a grid-based approach for initial positions
                    const gridCols = Math.ceil(Math.sqrt(NUM_NODES * gallery.clientWidth / gallery.clientHeight));
                    const gridRows = Math.ceil(NUM_NODES / gridCols);
                    
                    // Generate positions for all nodes at once
                    const positions = [];
                    
                    // First try a grid-based approach for more even distribution
                    const cellWidth = maxWidth / gridCols;
                    const cellHeight = maxHeight / gridRows;
                    
                    for (let i = 0; i < gridRows; i++) {
                        for (let j = 0; j < gridCols; j++) {
                            if (positions.length < NUM_NODES) {
                                // Add some randomness within each cell
                                const x = j * cellWidth + Math.random() * (cellWidth - nodeSize);
                                const y = i * cellHeight + Math.random() * (cellHeight - nodeSize);
                                positions.push({ x, y });
                            }
                        }
                    }
                    
                    // Shuffle positions to make the placement less regular
                    shuffleArray(positions);
                    
                    // Adjust positions to avoid overlaps using repulsion
                    for (let iteration = 0; iteration < 50; iteration++) {
                        let moved = false;
                        
                        for (let i = 0; i < positions.length; i++) {
                            for (let j = 0; j < positions.length; j++) {
                                if (i === j) continue;
                                
                                const dx = positions[i].x - positions[j].x;
                                const dy = positions[i].y - positions[j].y;
                                const distance = Math.sqrt(dx * dx + dy * dy);
                                
                                if (distance < spacing) {
                                    moved = true;
                                    
                                    // Calculate repulsion force (stronger when closer)
                                    const force = (spacing - distance) / distance;
                                    
                                    // Move both nodes away from each other
                                    positions[i].x += dx * force * 0.5;
                                    positions[i].y += dy * force * 0.5;
                                    positions[j].x -= dx * force * 0.5;
                                    positions[j].y -= dy * force * 0.5;
                                    
                                    // Keep within bounds
                                    positions[i].x = Math.max(0, Math.min(maxWidth, positions[i].x));
                                    positions[i].y = Math.max(0, Math.min(maxHeight, positions[i].y));
                                    positions[j].x = Math.max(0, Math.min(maxWidth, positions[j].x));
                                    positions[j].y = Math.max(0, Math.min(maxHeight, positions[j].y));
                                }
                            }
                        }
                        
                        if (!moved) break; // Stop if no nodes were moved
                    }
                    
                    return positions;
                }
                
                // Helper to shuffle an array
                function shuffleArray(array) {
                    for (let i = array.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [array[i], array[j]] = [array[j], array[i]];
                    }
                    return array;
                }
                
                function createNode(imageData, index, position) {
                    const node = document.createElement("div");
                    node.classList.add("node");
                    node.style.left = `${position.x}px`;
                    node.style.top = `${position.y}px`;
                    
                    // Try to load the image
                    const img = document.createElement("img");
                    
                    // Set up error handling with multiple fallbacks
                    img.onerror = function() {
                        console.warn(`Failed to load primary image: ${imageData.path}, trying fallback...`);
                        
                        // Try the fallback URL if available
                        if (imageData.fallback && this.src !== imageData.fallback) {
                            this.src = imageData.fallback;
                        } else {
                            // If fallback also fails or doesn't exist, use a color
                            console.warn(`Using color fallback for node ${index}`);
                            node.classList.add("image-error");
                            node.style.backgroundColor = fallbackColors[index % fallbackColors.length];
                            
                            // Remove the failed image
                            if (node.contains(img)) {
                                node.removeChild(img);
                            }
                        }
                    };
                    
                    // Start with the primary image path
                    img.src = imageData.path;
                    img.alt = "Gallery artwork";
                    node.appendChild(img);
                    
                    gallery.appendChild(node);
                    
                    const nodeData = { 
                        element: node, 
                        x: position.x + nodeSize/2, 
                        y: position.y + nodeSize/2, 
                        connections: [] 
                    };
                    nodes.push(nodeData);
                    
                    return nodeData;
                }
                
                function createConnection(nodeA, nodeB) {
                    if (!nodeA || !nodeB) return null;
                    
                    const line = document.createElement("div");
                    line.classList.add("line");
                    gallery.insertBefore(line, gallery.firstChild);
                    
                    const connection = { element: line, nodeA, nodeB };
                    connections.push(connection);
                    
                    nodeA.connections.push(connection);
                    nodeB.connections.push(connection);
                    
                    updateConnection(connection);
                    return connection;
                }
                
                function updateConnection(connection) {
                    const { element, nodeA, nodeB } = connection;
                    
                    const x1 = nodeA.x;
                    const y1 = nodeA.y;
                    const x2 = nodeB.x;
                    const y2 = nodeB.y;
                    
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    
                    element.style.width = `${length}px`;
                    element.style.left = `${x1}px`;
                    element.style.top = `${y1}px`;
                    element.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
                }
                
                // Place nodes without overlaps
                console.log(`Creating ${NUM_NODES} nodes with improved placement...`);
                const positions = placeNodesWithoutOverlap();
                const createdNodes = [];
                
                // Create all nodes using the calculated positions
                for (let i = 0; i < NUM_NODES; i++) {
                    const imageData = images[i % images.length]; // Use modulo to handle if we have fewer images than nodes
                    const node = createNode(imageData, i, positions[i]);
                    if (node) createdNodes.push(node);
                }
                
                console.log(`Created ${createdNodes.length} nodes successfully`);
                
                // Connect each node to its 2 closest neighbors
                createdNodes.forEach(nodeA => {
                    const closest = createdNodes
                        .filter(nodeB => nodeB !== nodeA)
                        .map(nodeB => ({
                            nodeB,
                            dist: Math.hypot(nodeB.x - nodeA.x, nodeB.y - nodeA.y)
                        }))
                        .sort((a, b) => a.dist - b.dist)
                        .slice(0, 2);
                    
                    closest.forEach(({ nodeB }) => {
                        createConnection(nodeA, nodeB);
                    });
                });
                
                console.log(`Created ${connections.length} connections`);
                
                // Add hover effects
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
                
                // Update connections on window resize
                window.addEventListener("resize", function() {
                    // When window is resized, just update connection lines
                    // We don't reposition nodes to maintain user's view
                    connections.forEach(updateConnection);
                });
            }
        });
    </script>
</body>
</html>
