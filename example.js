import React from 'react';

class Example extends React.Component {
    constructor(props) {
        super(props);
        this.childRefs = []; // Array to hold references to child elements
    }

    componentDidMount() {
        // This runs once after the component is mounted
        console.log('Component mounted');
        // Access child elements using this.childRefs
        console.log('Child elements:', this.childRefs);
    }

    render() {
        const menu = [
            { id: 1, label: 'Item 1' },
            { id: 2, label: 'Item 2' },
            { id: 3, label: 'Item 3' },
        ];

        const containerStyle = {
            position: 'relative',
            width: '400px', // Width of the carousel container
            height: '400px', // Height of the carousel container
            border: '2px solid #ccc',
            borderRadius: '50%',
            margin: '0 auto',
        };

        const containerWidth = parseInt(containerStyle.width); // Extract width from style
        const containerHeight = parseInt(containerStyle.height); // Extract height from style
        const radius = 150; // Radius of the circular layout
        const centerX = containerWidth / 2; // Dynamically calculate X-coordinate of the center
        const centerY = containerHeight / 2; // Dynamically calculate Y-coordinate of the center

        return (
            <div style={containerStyle}>
                {/* SVG for circumference */}
                <svg
                    width="100%"
                    height="100%"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 0, // Place it behind the items
                    }}
                >
                    <circle
                        cx={centerX}
                        cy={centerY}
                        r={radius}
                        stroke="rgba(0, 0, 0, 0.5)" // Color of the circumference
                        strokeWidth="2"
                        fill="none"
                    />
                </svg>
                {/* Curvy overlay div */}
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
                        borderRadius: '50%', // Make it circular
                        clipPath: 'ellipse(75% 50% at 50% 50%)', // Create a curvy effect
                        zIndex: 1, // Ensure it overlays other elements
                    }}
                ></div>
                {menu.map((item, index) => {
                    const angle = (360 / menu.length) * index; // Calculate angle for each item
                    const x = centerX + radius * Math.cos((angle * Math.PI) / 180) - 50; // Adjust for item width
                    const y = centerY + radius * Math.sin((angle * Math.PI) / 180) - 50; // Adjust for item height

                    return (
                        <div
                            key={item.id}
                            ref={(el) => (this.childRefs[index] = el)} // Assign reference to this.childRefs
                            style={{
                                position: 'absolute',
                                width: '100px',
                                height: '100px',
                                backgroundColor: '#f0f0f0',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transformOrigin: 'center', // Pivot around the center
                                left: `${x}px`,
                                top: `${y}px`,
                                zIndex: 2, // Ensure items are above the overlay
                            }}
                        >
                            {item.label}
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default Example;
