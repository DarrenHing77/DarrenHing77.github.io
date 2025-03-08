document.addEventListener("DOMContentLoaded", function() {
    const gallery = document.getElementById("gallery");
    const nodes = [];
    const connections = [];
    const nodeSize = 110; // slightly reduced to avoid overlap clearly
    const spacing = 160;  // safe spacing between nodes
    const numNodes = 12; // Adjusted as per your preference

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


    const savedPositions = JSON.parse(localStorage.getItem('fixedNodePositions') || '{}');

    function isOverlapping(x, y) {
        return nodes.some(node => {
            const dist = Math.hypot(node.x - x, node.y - y);
            return dist < spacing;
        });
    }

    const spacing = nodeSize * 1.5;
    const padding = nodeSize / 2;

    function placeNodes() {
        for (let i = 0; i < images.length; i++) {
            let x, y, attempts = 0;

            if (savedPositions[`node-${i}`]) {
                ({ x, y } = savedPositions[`node-${i}`]);
            } else {
                do {
                    x = padding + Math.random() * (gallery.clientWidth - nodeSize - padding * 2);
                    y = padding + Math.random() * (gallery.clientHeight - nodeSize - padding * 2);
                    attempts++;
                } while (isOverlapping(x, y) && attempts < 5000);

                if (attempts >= 5000) {
                    console.warn(`Node-${i} placement overlap limit reached.`);
                }

                savedPositions[`node-${i}`] = { x, y };

            }

            const node = document.createElement("div");
            node.classList.add("node");
            node.style.left = `${x}px`;
            node.style.top = `${y}px`;
            node.innerHTML = `<img src="${images[i]}">`;

            node.onmouseenter = () => highlightConnections(node, true);
            node.onmouseleave = () => highlightConnections(node, false);

            gallery.appendChild(node);
            nodes.push({ element: node, x, y });
        }
        localStorage.setItem('fixedNodePositions', JSON.stringify(nodes.map(({x,y}) => ({x,y}))));
    }

    function createConnections() {
        nodes.forEach((node, index) => {
            const distances = nodes
                .filter(n => n !== node)
                .map(n => ({ node: n, distance: Math.hypot(n.x - node.x, n.y - node.y) }))
                .sort((a, b) => a.dist - b.dist)
                .slice(0, 2); // connect to closest 2 nodes

            distances.forEach(({ node: neighbor }) => {
                if (!connections.some(c => (c.nodeA === node && c.nodeB === neighbor) || (c.nodeA === neighbor && c.nodeB === node))) {
                    const line = document.createElement('div');
                    line.className = 'line';
                    gallery.insertBefore(line, gallery.firstChild);
                    updateConnection(line, node, neighbor);
                    connections.push({ element: line, nodeA: node, nodeB: neighbor });
                });
            });
        }
    }

    function updateConnections() {
        connections.forEach(({ element, nodeA, nodeB }) => {
            const x1 = nodeA.x + nodeSize / 2;
            const y1 = nodeA.y + nodeSize / 2;
            const x2 = nodeB.x + nodeSize / 2;
            const y2 = nodeB.y + nodeSize / 2;

            const dx = x2 - x1, dy = y2 - y1;
            const length = Math.hypot(dx, dy);

            element.style.width = `${length}px`;
            element.style.left = `${x1}px`;
            element.style.top = `${y1}px`;
            element.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
        });
    }

    function highlightConnections(node, highlight) {
        connections.forEach(({ element, nodeA, nodeB }) => {
            if (nodeA.element === node || nodeB.element === node) {
                const gradientDirection = nodeA.element === node ? 'to right' : 'to left';
                element.style.background = highlight ? `linear-gradient(${gradientDir}, #008CFF, rgba(255,255,255,0.1))` : 'rgba(255,255,255,0.2)';
            }
        });
    }

    // Clear once if needed:
    // localStorage.removeItem('fixedNodePositions');

    placeNodes();
    connectNodes();
    updateConnections();
    window.addEventListener('resize', updateConnections);
});
