document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.getElementById("gallery");
    const nodes = [];
    const connections = [];
    const nodeSize = 140; // reduced size for better spacing
    const spacing = 200;  // prevents overlaps
    const numNodes = 12;
    const padding = 20;   // prevents clipping at edges

    const images = [
        "media/orcKing01.jpg", "media/P_Rick01.jpg", "media/The-Smeds-and-the-Smoos.jpeg", "media/zog01.jpg",
        "media/your-image5.jpg", "media/your-image6.jpg", "media/your-image7.jpg", "media/your-image8.jpg",
        "media/your-image9.jpg", "media/your-image10.jpg", "media/your-image11.jpg", "media/your-image12.jpg"
    ];

    const savedPositions = JSON.parse(localStorage.getItem('fixedNodePositions') || '{}');

    function clearPositions() {
        localStorage.removeItem('fixedNodePositions');
    }
    // clearPositions();  // Run this line once in console to regenerate positions if needed

    function isOverlapping(x, y) {
        return nodes.some(node => Math.hypot(node.x - x, node.y - y) < spacing);
    }

    function createNode(image, index) {
        const positions = JSON.parse(localStorage.getItem('fixedNodePositions') || '{}');
        let x, y, attempts = 0;

        if (positions[`node-${index}`]) {
            ({ x, y } = positions[`node-${index}`]);
        } else {
            do {
                x = Math.random() * (gallery.clientWidth - nodeSize - 20) + 10;
                y = Math.random() * (gallery.clientHeight - nodeSize);
                attempts++;
            } while (isOverlapping(x, y) && attempts < 1000);

            positions[`node-${index}`] = { x, y };
            localStorage.setItem('fixedNodePositions', JSON.stringify(positions));
        }

        const node = document.createElement("div");
        node.className = "node";
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.innerHTML = `<img src="${image}">`;
        
        node.onmouseenter = () => highlight(node, true);
        node.onmouseleave = () => highlight(node, false);

        gallery.appendChild(node);
        nodes.push({ element: node, x, y });
    }

    function createConnections() {
        nodes.forEach(node => {
            const neighbors = nodes.filter(n => n !== node)
                .map(n => ({ node: n, dist: Math.hypot(node.x - n.x, node.y - n.y) }))
                .sort((a, b) => a.dist - b.dist)
                .slice(0, 2);

            neighbors.forEach(({ node: neighbor }) => {
                if (!connections.some(c =>
                    (c.nodeA === node && c.nodeB === neighbor) ||
                    (c.nodeA === neighbor && c.nodeB === node))) {
                    const line = document.createElement("div");
                    line.className = "line";
                    gallery.insertBefore(line, gallery.firstChild);
                    updateLine(line, node, neighbor);
                    connections.push({ element: line, nodeA: node, nodeB: neighbor });
                }
            });
        });
    }

    function updateLine(line, nodeA, nodeB) {
        const x1 = nodeA.x + nodeSize / 2, y1 = nodeA.y + nodeSize / 2;
        const x2 = nodeB.x + nodeSize / 2, y2 = nodeB.y + nodeSize / 2;
        const dx = x2 - x1, dy = y2 - y1;
        line.style.width = `${Math.hypot(dx, dy)}px`;
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
        line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
        line.style.height = "2px";
        line.style.position = "absolute";
        line.style.background = "rgba(255,255,255,0.3)";
        line.style.transformOrigin = "0 0";
        connections.push({ element: line, nodeA: node, nodeB: neighbor });
    }

    function highlight(node, hover) {
        node.style.borderColor = hover ? "#008CFF" : "white";
        connections.forEach(({ element, nodeA, nodeB }) => {
            if (nodeA.element === node || nodeB.element === node) {
                element.style.background = hover
                    ? "linear-gradient(to right, #008CFF, rgba(255,255,255,0.3))"
                    : "rgba(255,255,255,0.3)";
            }
        });
    }

    // Initialize Nodes & Connections
    for (let i = 0; i < numNodes; i++) createNode(images[i], i);
    createConnections();
});
