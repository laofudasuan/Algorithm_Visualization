// SVGRenderer.js - 负责将图导出为SVG格式
/**
 * SVG渲染器类
 * 负责将图导出为SVG格式
 */
export class SVGRenderer {
  constructor() {
    this.svgns = 'http://www.w3.org/2000/svg';
  }
  
  /**
   * 将图数据转换为SVG元素
   */
  graphToSVG(nodes, edges, width, height) {
    // 创建SVG元素
    const svg = document.createElementNS(this.svgns, 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('xmlns', this.svgns);
    
    // 添加边
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const line = document.createElementNS(this.svgns, 'line');
        line.setAttribute('x1', sourceNode.x);
        line.setAttribute('y1', sourceNode.y);
        line.setAttribute('x2', targetNode.x);
        line.setAttribute('y2', targetNode.y);
        line.setAttribute('stroke', edge.style?.stroke || '#999999');
        line.setAttribute('stroke-width', edge.style?.lineWidth || 2);
        
        svg.appendChild(line);
      }
    });
    
    // 添加节点
    nodes.forEach(node => {
      const size = node.size || 20;
      let element;
      
      if (node.type === 'square') {
        // 创建矩形节点
        element = document.createElementNS(this.svgns, 'rect');
        element.setAttribute('x', node.x - size / 2);
        element.setAttribute('y', node.y - size / 2);
        element.setAttribute('width', size);
        element.setAttribute('height', size);
      } else {
        // 创建圆形节点
        element = document.createElementNS(this.svgns, 'circle');
        element.setAttribute('cx', node.x);
        element.setAttribute('cy', node.y);
        element.setAttribute('r', size / 2);
      }
      
      // 设置节点样式
      element.setAttribute('fill', node.style?.fill || '#3f51b5');
      element.setAttribute('stroke', node.style?.stroke || '#ffffff');
      element.setAttribute('stroke-width', node.style?.lineWidth || 2);
      
      svg.appendChild(element);
      
      // 添加节点标签
      if (node.label) {
        const text = document.createElementNS(this.svgns, 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', node.style?.labelFill || '#ffffff');
        text.setAttribute('font-size', node.style?.labelFontSize || 12);
        text.textContent = node.label;
        
        svg.appendChild(text);
      }
    });
    
    return svg;
  }
  
  /**
   * 将SVG元素转换为字符串
   */
  svgToString(svg) {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svg);
  }
}

export default SVGRenderer;