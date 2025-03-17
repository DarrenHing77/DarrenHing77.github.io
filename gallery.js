document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.getElementById("gallery");
    const nodes = [];
    const connections = [];
    const nodeSize = 140;
    const spacing = nodeSize * 1.8;
    const numNodes = 12; // Reduced to 12 for better spacing

    const images = [
        "media/orcKing01.jpg", "media/P_Rick01.jpg", "media/The-Smeds-and-the-Smoos.jpeg", "media/zog01.jpg",
        "media/Carnage_Wlde_Eevee.jpg", "media/HighwayRat01.jpg", "media/Nazgul_Full_v002.jpg", 
        "media/Revolting-Rhymes-Wolf.jpg", "media/SpaceMarines_UE.jpeg", "media/StickMan_Sc&S_h1.jpg"
    ];

    function isOverlapping(newX, newY) {
        return nodes.some(node => {
            const dx = node.x - newX;
            const dy = node.y - newY;
            return Math.sqrt(dx * dx + dy * dy) < spacing;
        });
    }

    function createNode(image) {
        let x, y, attempts = 0;
        do {
            x = Math.random() * (gallery.clientWidth - nodeSize * 1.5);
            y = Math.random() * (gallery.clientHeight - nodeSize * 1.5);
            attempts++;
        } while (isOverlapping(x, y) && attempts < 50);

        if (attempts >= 50) return;

        const node = document.createElement("div");
        node.classList.add("node");
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;

        const img = document.createElement("img");
        img.src = image;
        node.appendChild(img);

        gallery.appendChild(node);
        nodes.push({ element: node, x, y });
    }

    function createConnection(nodeA, nodeB) {
        if (!nodeA || !nodeB) return;

        const line = document.createElement("div");
        line.classList.add("line");
        gallery.insertBefore(line, gallery.firstChild);
        connections.push({ element: line, nodeA, nodeB });
    }

    images.forEach(img => createNode(img));

    // Connect nearest neighbors
    nodes.forEach((nodeA, index) => {
        let closest = nodes
            .map((nodeB, i) => ({ nodeB, dist: Math.hypot(nodeB.x - nodeA.x, nodeB.y - nodeA.y), i }))
            .filter(({ nodeB }) => nodeA !== nodeB)
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 2); // Connect to 2 closest

        closest.forEach(({ nodeB }) => createConnection(nodeA, nodeB));
    });

    function updateConnections() {
        connections.forEach(({ element, nodeA, nodeB }) => {
            const x1 = nodeA.element.offsetLeft + nodeSize / 2;
            const y1 = nodeA.element.offsetTop + nodeSize / 2;
            const x2 = nodeB.element.offsetLeft + nodeSize / 2;
            const y2 = nodeB.element.offsetTop + nodeSize / 2;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.hypot(dx, dy);

            element.style.width = `${length}px`;
            element.style.left = `${x1}px`;
            element.style.top = `${y1}px`;
            element.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
        });
    }

    updateConnections();
});
