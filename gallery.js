document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.getElementById("gallery");
    const nodes = [];
    const connections = [];
    const nodeSize = 200;
    const spacing = nodeSize * 1.5;
    const padding = nodeSize / 2;
    const numNodes = 10; // Total images you provided

    const images = [
        "media/orcKing01.jpg",
        "media/P_Rick01.jpg",
        "media/The-Smeds-and-the-Smoos.jpeg",
        "media/zog01.jpg",
        "media/Carnage_WIde_Eevee.jpg",
        "media/HighwayRat01.jpg",
        "media/Nazgul_Full_v002.jpg",
        "media/Revolting-Rhymes-Wolf.jpg",
        "media/SpaceMarines_UE.jpeg",
        "media/StickMan_Sc8_Sh1.jpg"
    ];

    function isOverlapping(newX, newY) {
        return nodes.some(node => {
            const dx = node.x - newX;
            const dy = node.y - newY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < spacing;
        });
    }

    function createNode(image) {
        let x, y, tries = 0;
        const safeMargin = nodeSize * 1.2;

        do {
            x = Math.random() * (gallery.clientWidth - safeMargin - padding) + padding;
            y = Math.random() * (gallery.clientHeight - safeMargin - padding) + padding;
            tries++;
        } while (isOverlapping(x, y) && tries < 100);

        if (tries >= 100) return;

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
        const line = document.createElement("div");
        line.classList.add("line");
        gallery.insertBefore(line, gallery.firstChild);
        connections.push({ element: line, nodeA, nodeB });
    }

    images.forEach(img => createNode(img));

    nodes.sort((a, b) => a.x - b.x);
    for (let i = 0; i < nodes.length - 1; i++) {
        createConnection(nodes[i], nodes[i + 1]);
    }

    function updateConnections() {
        connections.forEach(({ element, nodeA, nodeB }) => {
            const x1 = nodeA.element.offsetLeft + nodeSize / 2;
            const y1 = nodeA.element.offsetTop + nodeSize / 2;
            const x2 = nodeB.element.offsetLeft + nodeSize / 2;
            const y2 = nodeB.element.offsetTop + nodeSize / 2;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);

            element.style.width = `${length}px`;
            element.style.left = `${x1}px`;
            element.style.top = `${y1}px`;
            element.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
        });
    }

    updateConnections();
});
