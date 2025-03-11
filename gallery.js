document.addEventListener("DOMContentLoaded", function () {
    const svg = document.getElementById("gallery");
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const nodeSize = 80;
    const spacing = nodeSize * 1.5;
    const images = [
        "media/orcKing01.jpg", "media/P_Rick01.jpg", "media/The-Smeds-and-the-Smoos.jpeg", "media/zog01.jpg",
        "media/Carnage_WIde_Eevee.jpg", "media/HighwayRat01.jpg", "media/Nazgul_Full_v002.jpg", 
        "media/Revolting-Rhymes-Wolf.jpg", "media/SpaceMarines_UE.jpeg", "media/StickMan_Sc8_Sh1.jpg",
        "media/your-image11.jpg", "media/your-image12.jpg"
    ];

    // Circle packing algorithm to prevent overlap
    let circles = [];
    let attempts = 0;
    while (circles.length < images.length && attempts < images.length * 10) {
        let newCircle = {
            x: Math.random() * (width - nodeSize) + nodeSize / 2,
            y: Math.random() * (height - nodeSize) + nodeSize / 2,
            r: nodeSize / 2
        };

        let overlapping = circles.some(other => {
            let d = Math.sqrt((newCircle.x - other.x) ** 2 + (newCircle.y - other.y) ** 2);
            return d < nodeSize;
        });

        if (!overlapping) circles.push(newCircle);
        attempts++;
    }

    // Draw circles
    circles.forEach((circle, index) => {
        let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        let img = document.createElementNS("http://www.w3.org/2000/svg", "image");
        img.setAttribute("href", images[index]);
        img.setAttribute("x", circle.x - nodeSize / 2);
        img.setAttribute("y", circle.y - nodeSize / 2);
        img.setAttribute("width", nodeSize);
        img.setAttribute("height", nodeSize);
        img.setAttribute("clip-path", "circle()");

        let outline = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        outline.setAttribute("cx", circle.x);
        outline.setAttribute("cy", circle.y);
        outline.setAttribute("r", nodeSize / 2);
        outline.setAttribute("class", "circle-outline");

        g.appendChild(outline);
        g.appendChild(img);
        svg.appendChild(g);
    });

    // Generate connections
    let connections = [];
    circles.forEach((circle, i) => {
        let closest = circles
            .map((other, j) => ({
                index: j,
                dist: Math.sqrt((circle.x - other.x) ** 2 + (circle.y - other.y) ** 2)
            }))
            .filter(o => o.index !== i)
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 2); // Connect to 2 closest neighbors

        closest.forEach(o => {
            let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", circle.x);
            line.setAttribute("y1", circle.y);
            line.setAttribute("x2", circles[o.index].x);
            line.setAttribute("y2", circles[o.index].y);
            line.setAttribute("class", "line");
            svg.insertBefore(line, svg.firstChild);
            connections.push(line);
        });
    });

});
