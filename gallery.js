document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.getElementById("gallery");
    const nodes = [];        // Array to store all nodes (circles)
    const connections = [];  // Array to store connection lines
    const nodeSize = 130;    // Diameter of each node circle
    const spacing = nodeSize * 1.5; // Minimum spacing between circles to avoid overlap
    const padding = nodeSize / 2;   // Padding from edges to avoid clipping
    const numNodes = 12;     // Total number of nodes to generate

    const images = [
        "media/orcKing01.jpg", "media/P_Rick01.jpg", "media/The-Smeds-and-the-Smoos.jpeg", "media/zog01.jpg",
        "media/Carnage_WIde_Eevee.jpg", "media/HighwayRat01.jpg", "media/Nazgul_Full_v002.jpg", 
        "media/Revolting-Rhymes-Wolf.jpg", "media/SpaceMarines_UE.jpeg", "media/StickMan_Sc8_Sh1.jpg",
        "media/your-image11.jpg", "media/your-image12.jpg"
    ];

    // Utility function to ensure new circles don't overlap existing ones
    function isOverlapping(newX, newY) {
        return nodes.some(node => {
            const dx = node.x - newX;
            const dy = node.y - newY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < spacing;
        });
    }

    // Create circles at random, non-overlapping positions
    function createNode(image) {
        let x, y, attempts = 0;
        const maxAttempts = 100; // Avoid infinite loops

        do {
            x = padding + Math.random() * (gallery.clientWidth - nodeSize - 2 * padding);
            y = padding + Math.random() * (gallery.clientHeight - nodeSize - 2 * padding);
            attempts++;
        } while (isOverlapping(x, y) && attempts < maxAttempts);

        if (attempts >= maxAttempts) return; // Abort if unable to place circle after many tries

        // Create DOM element for the node
        const node = document.createElement("div");
        node.classList.add("node");
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;

        const img = document.createElement("img");
        img.src = image;
        node.appendChild(img);
        gallery.appendChild(node);

        // Store node position and element for later use
        nodes.push({ element: node, x, y });
    }

    // Generate all nodes
    images.slice(0, numNodes).forEach(img => createNode(img));

    // Calculate distance between two nodes
    function calculateDistance(nodeA, nodeB) {
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Create connections (lines) between each node and its two closest neighbors
    nodes.forEach(node => {
        const distances = nodes
            .filter(n => n !== node)
            .map(n => ({ node: n, dist: calculateDistance(node, n) }))
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 2); // Take two closest nodes

        distances.forEach(neighbor => {
            // Avoid creating duplicate connections
            if (!connections.some(c =>
                (c.nodeA === node && c.nodeB === neighbor.node) ||
                (c.nodeA === neighbor.node && c.nodeB === node))) {

                const line = document.createElement("div");
                line.className = 'line';
                gallery.insertBefore(line, gallery.firstChild);

                connections.push({
                    element: line,
                    nodeA: node,
                    nodeB: neighbor.node
                });
            }
        });
    });

    // Update line positions based on connected node centers
    function updateConnections() {
        connections.forEach(({ element, nodeA, nodeB }) => {
            const x1 = nodeA.x + nodeSize / 2;
            const y1 = nodeA.y + nodeSize / 2;
            const x2 = nodeB.x + nodeSize / 2;
            const y2 = nodeB.y + nodeSize / 2;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);

            element.style.width = `${length}px`;
            element.style.left = `${x1}px`;
            element.style.top = `${y1}px`;
            element.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
        });
    }

    // Initial call to set up lines correctly
    updateConnections();

    // Highlight connections when hovering nodes
    nodes.forEach(node => {
        node.element.addEventListener('mouseenter', () => {
            connections.forEach(c => {
                if (c.nodeA === node || c.nodeB === node) {
                    c.element.style.background = 'linear-gradient(to right, #00f, transparent)';
                }
            });
            node.element.style.borderColor = '#00f';
        });

        node.element.addEventListener('mouseleave', () => {
            connections.forEach(c => {
                if (c.nodeA === node || c.nodeB === node) {
                    c.element.style.background = 'linear-gradient(to right, #666, transparent)';
                }
            });
            node.element.style.borderColor = '#fff';
        });
    });

    // Save fixed positions to localStorage to avoid layout changing on refresh
    function savePositions() {
        const positions = nodes.map(({ x, y }) => ({ x, y }));
        localStorage.setItem('nodePositions', JSON.stringify(positions));
    }

    function loadPositions() {
        const positions = JSON.parse(localStorage.getItem('nodePositions'));
        if (positions && positions.length === nodes.length) {
            positions.forEach((pos, i) => {
                nodes[i].x = pos.x;
                nodes[i].y = pos.y;
                nodes[i].element.style.left = `${pos.x}px`;
                nodes[i].element.style.top = `${pos.y}px`;
            });
            updateConnections();
        }
    }

    // Attempt to load saved positions, or save positions if none found
    loadPositions();
    if (!localStorage.getItem('nodePositions')) savePositions();
});
