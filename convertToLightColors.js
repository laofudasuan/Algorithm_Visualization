import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

// 将十六进制颜色转换为HSL
function hexToHSL(hex) {
    // 移除#号
    hex = hex.replace('#', '');
    
    // 转换为RGB
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // 计算最大值和最小值
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0; // 灰度
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return [h * 360, s * 100, l * 100];
}

// 将HSL转换为十六进制颜色
function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l; // 灰度
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = (x) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return '#' + toHex(r) + toHex(g) + toHex(b);
}

// 检查颜色是否为深色（基于HSL中的明度值）
function isDarkColor(hex) {
    const [, , l] = hexToHSL(hex);
    // 明度低于50%的颜色认为是深色
    return l < 50;
}

// 将深色转换为浅色（保持色相和饱和度，提高明度）
function convertToLightColor(hex) {
    const [h, s, l] = hexToHSL(hex);
    
    // 如果是深色，提高明度到70-85%范围
    // 对于非常深的颜色，提升更多；对于不那么深的颜色，提升较少
    const lightnessFactor = Math.min(85, 50 + (50 - l) * 0.7);
    
    // 保持色相和饱和度基本不变，但可以稍微降低饱和度使颜色更柔和
    const newSaturation = Math.max(0, s - 10);
    
    return hslToHex(h, newSaturation, lightnessFactor);
}

// 处理单个JSON文件
function processGraphFile(filePath) {
    try {
        // 读取文件内容
        const content = readFileSync(filePath, 'utf8');
        const graph = JSON.parse(content);
        
        // 检查是否有nodes数组
        if (Array.isArray(graph.nodes)) {
            let changedCount = 0;
            
            // 处理每个节点的颜色
            graph.nodes.forEach(node => {
                if (node.style && node.style.fill) {
                    const originalColor = node.style.fill;
                    
                    // 如果是深色，转换为浅色
                    if (isDarkColor(originalColor)) {
                        node.style.fill = convertToLightColor(originalColor);
                        changedCount++;
                    }
                }
            });
            
            // 写回文件
            writeFileSync(filePath, JSON.stringify(graph, null, 2), 'utf8');
            console.log(`已成功处理文件: ${filePath}, 转换了 ${changedCount} 个深色节点`);
        } else {
            console.log(`文件 ${filePath} 没有nodes数组，跳过处理`);
        }
    } catch (error) {
        console.error(`处理文件 ${filePath} 时出错:`, error.message);
    }
}

// 主函数：处理graphs目录中的所有JSON文件
function main() {
    const graphsDir = 'd:\\Develop\\Algorithm_Visualization\\src\\data\\graphs';
    
    try {
        // 读取目录中的所有文件
        const files = readdirSync(graphsDir);
        
        // 处理每个JSON文件
        files.forEach(file => {
            if (file.endsWith('.json')) {
                const filePath = join(graphsDir, file);
                processGraphFile(filePath);
            }
        });
        
        console.log('所有文件处理完成！');
    } catch (error) {
        console.error('读取目录时出错:', error.message);
    }
}

// 运行脚本
main();