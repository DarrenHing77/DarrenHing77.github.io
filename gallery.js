document.addEventListener("DOMContentLoaded", function() {
    const gallery = document.getElementById("gallery");
    const nodes = [];
    const connections = [];
    const nodeSize = 120; // clearly smaller size
    const spacing = 160; // clearly prevents overlap
    const numNodes = 12;

    const images = [
        "media/orcKing01.jpg", "media/P_Rick01.jpg", "media/The-Smeds-and-the-Smoos.jpeg", "media/zog01.jpg",
        "media/your-image5.jpg", "media/your-image6.jpg", "media/your-image7.jpg", "media/your-image8.jpg",
        "media/your-image9.jpg", "media/your-image10.jpg", "media/your-image11.jpg", "media/your-image12.jpg"
    ];

    // reset saved positions ONCE if needed
    // localStorage.removeItem('fixedNodePositions');

    const savedPositions = JSON.parse(localStorage.getItem('fixedNodePositions') || '{}');

    function isOverlapping(x, y) {
        return nodes.some(node => Math.hypot(node.x - x, node.y - y) < spacing);
    }

    for (let i = 0; i < numNodes; i++) {
        let x, y, attempts = 0;

        if (savedPositions[`node-${i}`]) {
            ({ x, y } = savedPositions[`node-${i}`]);
        } else {
            do {
                x = Math.random() * (gallery.clientWidth - nodeSize);
                y = Math.random() * (gallery.clientHeight - nodeSize);
                attempts++;
            } while (isOverlapping(x, y) && attempts < 5000);

            savedPositions[`node-${i}`] = { x, y };
        }

        const node = document.createElement("div");
        node.className = "node";
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.innerHTML = `<img src="${images[i]}">`;

        node.onmouseenter = () => highlight(node, true);
        node.onmouseleave = () => highlight(node, false);

        gallery.appendChild(node);
        nodes.push({element: node, x, y});
    }

    localStorage.setItem('fixedNodePositions', JSON.stringify(savedPositions));

    function connectNodes() {
        nodes.forEach(node => {
            const neighbors = nodes.filter(n => n !== node)
                .map(n => ({ node: n, dist: Math.hypot(node.x - n.x, node.y - n.y) }))
                .sort((a, b) => a.dist - b.dist)
                .slice(0, 2);

            neighbors.forEach(({node: neighbor}) => {
                if (!connections.some(c => 
                    (c.nodeA === node && c.nodeB === neighbor) || 
                    (c.nodeA === neighbor && c.nodeB === node))) {
                    const line = document.createElement("div");
                    line.className = "line";
                    gallery.insertBefore(line, gallery.firstChild);
                    updateLine(line, node, neighbor);
                    connections.push({element: line, nodeA: node, nodeB: neighbor});
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
    }

    function highlight(node, hover) {
        connections.forEach(({ element, nodeA, nodeB }) => {
            if (nodeA.element === node || nodeB.element === node) {
                const gradientDir = nodeA.element === node ? 'to right' : 'to left';
                element.style.background = hover ?
                    `linear-gradient(${gradientDir}, #008CFF, rgba(255,255,255,0.2))` :
                    'rgba(255,255,255,0.3)';
            }
        });
    }

    connectNodes();
});
