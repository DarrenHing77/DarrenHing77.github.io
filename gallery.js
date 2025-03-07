document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.getElementById("gallery");
    const nodes = [];
    const connections = [];
    const nodeSize = 180;
    const spacing = 280; // increased to prevent overlap
    const numNodes = 12;

    const images = [
        "media/orcKing01.jpg", "media/P_Rick01.jpg", "media/The-Smeds-and-the-Smoos.jpeg", "media/zog01.jpg",
        "media/your-image5.jpg", "media/your-image6.jpg", "media/your-image7.jpg", "media/your-image8.jpg",
        "media/your-image9.jpg", "media/your-image10.jpg", "media/your-image11.jpg", "media/your-image12.jpg"
    ];

    function clearPositions() {
        localStorage.removeItem('fixedNodePositions');
    }
    // Uncomment below once, then reload to reset positions
    // clearPositions();

    function isOverlapping(x, y) {
        return nodes.some(node => {
            const dx = node.x - x;
            const dy = node.y - y;
            return Math.hypot(dx, dy) < spacing;
        });
    }

    function createNode(image, index) {
        const positions = JSON.parse(localStorage.getItem('fixedNodePositions') || '{}');
        const maxTries = 1000;
        let tries = 0, x, y;

        if (positions[`node-${index}`]) {
            ({ x, y } = positions[`node-${index}`]);
        } else {
            do {
                x = Math.random() * (gallery.clientWidth - nodeSize);
                y = Math.random() * (gallery.clientHeight - nodeSize);
                tries++;
            } while (isOverlapping(x, y) && tries < maxTries);

            positions[`node-${index}`] = { x, y };
            localStorage.setItem('fixedNodePositions', JSON.stringify(positions));
        }

        const node = document.createElement("div");
        node.className = "node";
        node.id = `node-${index}`;
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;

        const img = document.createElement("img");
        img.src = image;
        node.appendChild(img);
        gallery.appendChild(node);

        nodes.push({ element: node, x, y });

        node.addEventListener("mouseenter", () => highlight(node, true));
        node.addEventListener("mouseleave", () => highlight(node, false));
    }

    function createConnections() {
        nodes.forEach(node => {
            getNeighbors(node, 2, 350).forEach(neighbor => createConnection(node, neighbor));
        });
        updateConnections();
    }

    function getNeighbors(node, count, maxDist) {
        return nodes.filter(n => n !== node)
            .map(n => ({ node: n, dist: Math.hypot(n.x - node.x, n.y - node.y) }))
            .filter(n => n.dist < maxDist)
            .sort((a, b) => a.dist - b.dist)
            .slice(0, count)
            .map(n => n.node);
    }

    function createConnection(nodeA, nodeB) {
        if (connections.some(c =>
            (c.nodeA === nodeA && c.nodeB === nodeB) || 
            (c.nodeA === nodeB && c.nodeB === nodeA))) return;

        const line = document.createElement("div");
        line.className = "line";
        gallery.insertBefore(line, gallery.firstChild);
        connections.push({ element: line, nodeA, nodeB });
    }

    function updateConnections() {
        connections.forEach(({ element, nodeA, nodeB }) => {
            const x1 = nodeA.x + nodeSize / 2;
            const y1 = nodeA.y + nodeSize / 2;
            const x2 = nodeB.x + nodeSize / 2;
            const y2 = nodeB.y + nodeSize / 2;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.hypot(dx, dy);

            element.style.width = `${length}px`;
            element.style.left = `${x1}px`;
            element.style.top = `${y1}px`;
            element.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
            element.style.background = "rgba(255,255,255,0.5)";
            element.style.height = "2px";
            element.style.position = "absolute";
            element.style.transformOrigin = "0 0";
            element.style.zIndex = "0";
        });
    }

    function highlight(node, hover) {
        node.style.borderColor = hover ? "rgba(0,140,255,1)" : "white";
        connections.forEach(({ element, nodeA, nodeB }) => {
            if (nodeA.element === node || nodeB.element === node) {
                element.style.background = hover
                    ? "linear-gradient(to right, rgba(0,140,255,1), white)"
                    : "rgba(255,255,255,0.5)";
            }
        });
    }

    // Initialize Nodes & Connections
    for (let i = 0; i < numNodes; i++) createNode(images[i], i);
    createConnections();
});
