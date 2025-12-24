import React, { useEffect, useRef } from 'react';

interface Star {
    x: number;
    y: number;
    z: number;
    radius: number;
    color: string;
    velocity: number;
    opacity: number;
}

interface Connection {
    from: number;
    to: number;
}

const StellarBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<Star[]>([]);
    const connectionsRef = useRef<Connection[]>([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const animationRef = useRef<number>(0);

    const colors = [
        'rgba(247, 37, 133, 0.8)',   // neonPink
        'rgba(114, 9, 183, 0.8)',    // neonPurple
        'rgba(76, 201, 240, 0.8)',   // cyanLight
        'rgba(67, 97, 238, 0.8)',    // electricBlue
        'rgba(255, 255, 255, 0.6)', // white
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initStars();
        };

        const initStars = () => {
            const numStars = Math.floor((canvas.width * canvas.height) / 8000);
            starsRef.current = Array.from({ length: numStars }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                z: Math.random() * 3 + 0.5,
                radius: Math.random() * 2 + 0.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                velocity: Math.random() * 0.3 + 0.1,
                opacity: Math.random() * 0.5 + 0.3,
            }));
        };

        const updateConnections = () => {
            const stars = starsRef.current;
            const connections: Connection[] = [];
            const connectionDistance = 150;

            for (let i = 0; i < stars.length; i++) {
                for (let j = i + 1; j < stars.length; j++) {
                    const dx = stars[i].x - stars[j].x;
                    const dy = stars[i].y - stars[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        connections.push({ from: i, to: j });
                    }
                }
            }
            connectionsRef.current = connections;
        };

        const drawGlow = (x: number, y: number, radius: number, color: string) => {
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 4);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
            ctx.fill();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw gradient background
            const bgGradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width * 0.8
            );
            bgGradient.addColorStop(0, 'rgba(17, 24, 39, 0.1)');
            bgGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const stars = starsRef.current;
            const mouse = mouseRef.current;

            // Update star positions with parallax effect
            stars.forEach((star) => {
                // Move stars slowly
                star.y += star.velocity * star.z;

                // Wrap around
                if (star.y > canvas.height + 10) {
                    star.y = -10;
                    star.x = Math.random() * canvas.width;
                }

                // Parallax effect based on mouse position
                const parallaxX = (mouse.x - canvas.width / 2) * 0.01 * star.z;
                const parallaxY = (mouse.y - canvas.height / 2) * 0.01 * star.z;

                const drawX = star.x + parallaxX;
                const drawY = star.y + parallaxY;

                // Pulsing opacity
                const pulse = Math.sin(Date.now() * 0.002 + star.x) * 0.2 + 0.8;

                // Draw glow
                drawGlow(drawX, drawY, star.radius, star.color.replace('0.8', String(star.opacity * pulse * 0.3)));

                // Draw star
                ctx.beginPath();
                ctx.arc(drawX, drawY, star.radius * star.z, 0, Math.PI * 2);
                ctx.fillStyle = star.color.replace('0.8', String(star.opacity * pulse));
                ctx.fill();
            });

            // Draw connections (constellation effect)
            updateConnections();
            connectionsRef.current.forEach(({ from, to }) => {
                const starA = stars[from];
                const starB = stars[to];
                const dx = starA.x - starB.x;
                const dy = starA.y - starB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const opacity = (1 - distance / 150) * 0.15;

                ctx.beginPath();
                ctx.moveTo(starA.x, starA.y);
                ctx.lineTo(starB.x, starB.y);
                ctx.strokeStyle = `rgba(76, 201, 240, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            });

            // Draw mouse attraction field
            const mouseGradient = ctx.createRadialGradient(
                mouse.x, mouse.y, 0,
                mouse.x, mouse.y, 200
            );
            mouseGradient.addColorStop(0, 'rgba(247, 37, 133, 0.05)');
            mouseGradient.addColorStop(0.5, 'rgba(114, 9, 183, 0.02)');
            mouseGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = mouseGradient;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 200, 0, Math.PI * 2);
            ctx.fill();

            animationRef.current = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);

        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ background: 'transparent' }}
        />
    );
};

export default React.memo(StellarBackground);
