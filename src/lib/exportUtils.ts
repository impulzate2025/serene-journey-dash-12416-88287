export const exportPrompt = {
  toTXT: (prompt: string, filename: string) => {
    const blob = new Blob([prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  toJSON: (data: any, filename: string) => {
    const exportData = {
      version: '1.0',
      generated_at: new Date().toISOString(),
      effect: {
        type: data.effect_type || 'unknown',
        category: data.effect_category || 'unknown',
      },
      prompt: data.generated_prompt || data.prompt || '',
      settings: {
        intensity: data.intensity || 80,
        duration: data.duration || '3s',
        style: data.style || 'cinematic',
      },
      ai_analysis: data.ai_analysis || null,
      deep_analysis: data.deep_analysis || null,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  toCSV: (generations: any[], filename: string) => {
    const headers = ['Effect Type', 'Category', 'Prompt', 'Intensity', 'Duration', 'Created At'];
    const rows = generations.map(gen => [
      gen.effect_type || '',
      gen.effect_category || '',
      `"${(gen.generated_prompt || gen.prompt || '').replace(/"/g, '""')}"`,
      gen.intensity || '',
      gen.duration || '',
      gen.created_at ? new Date(gen.created_at).toISOString() : '',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  toMarkdown: (prompt: string, analysis: any, filename: string) => {
    const md = `# VFX Prompt
Generated: ${new Date().toISOString()}

## Prompt
${prompt}

## AI Analysis
${analysis ? Object.entries(analysis).map(([key, value]) => 
  `- **${key.replace(/([A-Z])/g, ' $1').trim()}**: ${value}`
).join('\n') : 'No analysis available'}
`;

    // Copy to clipboard instead of download
    navigator.clipboard.writeText(md).then(() => {
      console.log('Markdown copied to clipboard');
    });
  },
};
