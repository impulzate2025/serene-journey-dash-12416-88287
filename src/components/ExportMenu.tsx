import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Code, Table, FileCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportPrompt } from '@/lib/exportUtils';

interface ExportMenuProps {
  prompt: string;
  generationData?: any;
}

export const ExportMenu = ({ prompt, generationData }: ExportMenuProps) => {
  const { toast } = useToast();

  const handleExport = (format: 'txt' | 'json' | 'csv' | 'markdown') => {
    try {
      switch (format) {
        case 'txt':
          exportPrompt.toTXT(prompt, 'vfx-prompt.txt');
          break;
        case 'json':
          exportPrompt.toJSON(generationData || { prompt }, 'vfx-prompt.json');
          break;
        case 'csv':
          exportPrompt.toCSV([generationData || { prompt, effect_type: 'unknown' }], 'vfx-prompts.csv');
          break;
        case 'markdown':
          exportPrompt.toMarkdown(prompt, generationData?.ai_analysis, 'vfx-prompt.md');
          break;
      }
      toast({
        title: 'Exported Successfully',
        description: `Prompt exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleExport('txt')}>
          <FileText className="w-4 h-4 mr-2" />
          Download as TXT
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <Code className="w-4 h-4 mr-2" />
          Download as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <Table className="w-4 h-4 mr-2" />
          Download as CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('markdown')}>
          <FileCode className="w-4 h-4 mr-2" />
          Copy as Markdown
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
