import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CognitiveObject, CognitiveType } from '../types';

interface Props {
  objects: CognitiveObject[];
  width?: number;
  height?: number;
}

const typeColors: Record<string, string> = {
  [CognitiveType.FAIT]: '#3b82f6', // blue
  [CognitiveType.HYPOTHESE]: '#eab308', // yellow
  [CognitiveType.QUESTION]: '#a855f7', // purple
  [CognitiveType.CONTRAINTE]: '#ef4444', // red
  [CognitiveType.OBJECTIF]: '#22c55e', // green
  [CognitiveType.DECISION]: '#14b8a6', // teal
  [CognitiveType.MODELE]: '#f97316', // orange
};

const CognitiveVisualizer: React.FC<Props> = ({ objects, width = 600, height = 400 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!objects || objects.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    // Prepare data
    const nodes = objects.map(o => ({ ...o }));
    // Create links based on relations property or implied logic
    // For demo, we'll link objects sequentially if relations are empty to show flow
    const links: any[] = [];
    
    nodes.forEach((node, i) => {
        // Link to explicit relations if they exist
        if (node.relations && node.relations.length > 0) {
            node.relations.forEach(relId => {
                const target = nodes.find(n => n.id === relId || n.nom === relId);
                if (target) links.push({ source: node.id, target: target.id });
            });
        } 
        // Fallback: Link to central objective or previous node to keep graph connected
        else if (i > 0) {
           links.push({ source: nodes[i-1].id, target: node.id });
        }
    });

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(30));

    // Draw Links
    const link = svg.append("g")
      .attr("stroke", "#334155")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1);

    // Draw Nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.append("circle")
      .attr("r", (d) => 5 + (d.poids * 10))
      .attr("fill", (d) => typeColors[d.type] || '#94a3b8')
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .attr("class", "cursor-pointer hover:stroke-cyan-400 transition-colors");

    // Labels
    node.append("text")
      .text(d => d.nom)
      .attr("x", 12)
      .attr("y", 4)
      .attr("font-family", "JetBrains Mono")
      .attr("font-size", "10px")
      .attr("fill", "#cbd5e1");

    // Simulation Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

  }, [objects, width, height]);

  if (objects.length === 0) {
      return (
          <div className="flex items-center justify-center h-full text-numtema-muted font-mono text-sm opacity-50">
              NO COGNITIVE OBJECTS DETECTED
          </div>
      )
  }

  return (
    <div className="w-full h-full bg-numtema-bg/50 rounded-lg overflow-hidden relative">
        <div className="absolute top-2 left-2 text-xs font-mono text-numtema-primary opacity-70">
            D3.FORCE_LAYOUT :: ACTIVE
        </div>
        <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="w-full h-full" />
    </div>
  );
};

export default CognitiveVisualizer;
