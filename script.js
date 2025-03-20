// Common script for all pages
document.addEventListener("DOMContentLoaded", function() {
    console.log("Page loaded and ready");
    
    // Dropdown menu functionality
    document.querySelectorAll(".dropdown").forEach(dropdown => {
        dropdown.addEventListener("click", function(event) {
            event.stopPropagation();
            this.querySelector(".dropdown-content").classList.toggle("show");
        });
    });
    
    window.addEventListener("click", function() {
        document.querySelectorAll(".dropdown-content").forEach(menu => {
            menu.classList.remove("show");
        });
    });
    
    // Initialize homepage gallery if it exists
    initGallery();
    
    // Initialize image zoom on portfolio pages
    initPortfolioItems();
});

// Gallery initialization for homepage
function initGallery() {
    console.log("Initializing Gallery");
    const gallery = document.getElementById("gallery");
    
    if (!gallery) {
        console.log("No gallery found on this page");
        return;
    }
    
    // Node and connection data
    const nodeSize = 140;
    
    // Define fixed positions for 12 nodes
    const nodePositions = [
        // Position for each node
        {x: 100, y: 150},  // Node 1
        {x: 300, y: 100},  // Node 2
        {x: 500, y: 150},  // Node 3
        {x: 700, y: 100},  // Node 4
        {x: 900, y: 150},  // Node 5
        {x: 150, y: 300},  // Node 6
        {x: 350, y: 350},  // Node 7
        {x: 550, y: 300},  // Node 8
        {x: 750, y: 350},  // Node 9
        {x: 950, y: 300},  // Node 10
        {x: 200, y: 500},  // Node 11
        {x: 800, y: 500}   // Node 12
    ];
    
    // Define fixed connections
    const nodeConnections = [
        [0, 1], [1, 2], [2, 3], [3, 4],  // Top row connections
        [5, 6], [6, 7], [7, 8], [8, 9],  // Middle row connections                       
        [0, 5], [1, 6], [2, 7], [3, 8], [4, 9],  // Vertical connections
        [5, 10],[9,11]                // Connect to bottom row
    ];
    
    // Image paths with fallback colors
    const nodeImages = [
        {path: "media/orcKing01.jpg", color: "#ff69b4"},
        {path: "media/P_Rick01.jpg", color: "#9370db"},
        {path: "media/The-Smeds-and-the-Smoos.jpeg", color: "#00ced1"},
        {path: "media/zog01.jpg", color: "#32cd32"},
        {path: "media/Carnage_Wlde_Eevee.jpg", color: "#1e90ff"},
        {path: "media/HighwayRat01.jpg", color: "#ff7f50"},
        {path: "media/Nazgul_Full_v002.jpg", color: "#9932cc"},
        {path: "media/Revolting-Rhymes-Wolf.jpg", color: "#ffd700"},
        {path: "media/SpaceMarines_UE.jpeg", color: "#00ff7f"},
        {path: "media/StickMan_Sc&S_h1.jpg", color: "#ff4500"},
        {path: "media/placeholder1.jpg", color: "#4169e1"},
        {path: "media/placeholder2.jpg", color: "#8a2be2"}
    ];
    
    // Create nodes and connections arrays
    const nodes = [];
    const connections = [];
    
    // Create all 12 nodes with fixed positions
    for (let i = 0; i < 12; i++) {
        // Create node element
        const node = document.createElement("div");
        node.classList.add("node");
        node.style.left = `${nodePositions[i].x}px`;
        node.style.top = `${nodePositions[i].y}px`;
        
        // Try to add an image
        const img = document.createElement("img");
        img.src = nodeImages[i].path;
        img.alt = "Gallery artwork";
        
        // Handle image loading errors
        img.onerror = function() {
            console.warn(`Failed to load image: ${nodeImages[i].path}, using color fallback`);
            node.style.backgroundColor = nodeImages[i].color;
            
            // Remove the failed image
            if (node.contains(img)) {
                node.removeChild(img);
            }
        };
        
        // Add image to node
        node.appendChild(img);
        
        // Add to gallery
        gallery.appendChild(node);
        
        // Store node data
        nodes.push({
            element: node,
            x: nodePositions[i].x + nodeSize/2,
            y: nodePositions[i].y + nodeSize/2,
            connections: []
        });
    }
    
    // Create connections between nodes
    for (const [i, j] of nodeConnections) {
        if (i >= nodes.length || j >= nodes.length) continue;
        
        const nodeA = nodes[i];
        const nodeB = nodes[j];
        
        // Create line element
        const line = document.createElement("div");
        line.classList.add("line");
        gallery.insertBefore(line, gallery.firstChild);
        
        // Store connection data
        const connection = { element: line, nodeA, nodeB };
        connections.push(connection);
        
        // Store connection reference in nodes
        nodeA.connections.push(connection);
        nodeB.connections.push(connection);
        
        // Update line position
        updateConnection(connection);
    }
    
    // Function to update connection position and rotation
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
    
    // Add hover effects to nodes
    nodes.forEach(node => {
        node.element.addEventListener("mouseenter", () => {
            node.element.classList.add("active");
            node.connections.forEach(conn => {
                conn.element.style.height = "3px";
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
    
    // Update connections when window is resized
    window.addEventListener("resize", function() {
        connections.forEach(updateConnection);
    });
}

// Portfolio page image items
function initPortfolioItems() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (galleryItems.length === 0) {
        return;
    }
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').src;
            const imgAlt = this.querySelector('img').alt;
            
            // Create modal for image viewing
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.style.zIndex = '2000';
            modal.style.cursor = 'pointer';
            
            const modalImg = document.createElement('img');
            modalImg.src = imgSrc;
            modalImg.alt = imgAlt;
            modalImg.style.maxWidth = '90%';
            modalImg.style.maxHeight = '90%';
            modalImg.style.objectFit = 'contain';
            
            modal.appendChild(modalImg);
            document.body.appendChild(modal);
            
            // Close on click
            modal.addEventListener('click', function() {
                document.body.removeChild(modal);
            });
        });
    });
}
