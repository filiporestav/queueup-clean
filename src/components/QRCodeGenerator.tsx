import { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Printer, Info } from 'lucide-react';
import logoImage from '@/assets/logo.png';

interface QRCodeGeneratorProps {
  venueId: string;
  venueName: string;
  logoUrl?: string;
}

interface LayoutOption {
  value: string;
  label: string;
  codesPerPage: number;
  rows: number;
  cols: number;
  qrSize: number; // in mm
  description: string;
}

const layoutOptions: LayoutOption[] = [
  { value: '1', label: '1 per page', codesPerPage: 1, rows: 1, cols: 1, qrSize: 120, description: '120mm × 120mm (Large)' },
  { value: '4', label: '4 per page', codesPerPage: 4, rows: 2, cols: 2, qrSize: 80, description: '80mm × 80mm (Medium)' },
  { value: '6', label: '6 per page', codesPerPage: 6, rows: 2, cols: 3, qrSize: 60, description: '60mm × 60mm (Small)' },
  { value: '9', label: '9 per page', codesPerPage: 9, rows: 3, cols: 3, qrSize: 50, description: '50mm × 50mm (Small)' },
  { value: '12', label: '12 per page', codesPerPage: 12, rows: 3, cols: 4, qrSize: 40, description: '40mm × 40mm (Compact)' },
];

const QRCodeGenerator = ({ venueId, venueName, logoUrl }: QRCodeGeneratorProps) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<string>('1');

  const qrUrl = `${window.location.origin}/venue/${venueId}`;
  const currentLayout = layoutOptions.find(option => option.value === selectedLayout) || layoutOptions[0];

  useEffect(() => {
    generateQRCode();
  }, [venueId]);

  const generateQRCode = async () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        try {
          // Generate QR code data URL
          const qrDataUrl = await QRCode.toDataURL(qrUrl, {
            width: 400,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });
          
          // Create QR code image
          const qrImage = new Image();
          qrImage.onload = () => {
            // Set canvas size
            canvas.width = 400;
            canvas.height = 400;
            
            // Draw QR code
            ctx.drawImage(qrImage, 0, 0, 400, 400);
            
            // Add logo in the center
            const logo = new Image();
            logo.onload = () => {
              const logoSize = 80;
              const logoX = (400 - logoSize) / 2;
              const logoY = (400 - logoSize) / 2;
              
              // Create white background for logo
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(logoX - 10, logoY - 10, logoSize + 20, logoSize + 20);
              
              // Draw logo
              ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
            };
            logo.src = logoUrl || logoImage;
          };
          qrImage.src = qrDataUrl;
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      }
    }
  };

  const generateMultipleQRCodes = async () => {
    const qrSize = Math.floor((currentLayout.qrSize / 25.4) * 96); // Convert mm to pixels (96 DPI)
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: qrSize,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Create QR code with logo
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return qrDataUrl;

    canvas.width = qrSize;
    canvas.height = qrSize;

    const qrImage = new Image();
    qrImage.crossOrigin = 'anonymous'; // Allow cross-origin loading
    await new Promise((resolve, reject) => {
      qrImage.onload = resolve;
      qrImage.onerror = reject;
      qrImage.src = qrDataUrl;
    });

    ctx.drawImage(qrImage, 0, 0, qrSize, qrSize);

    // Add logo
    try {
      const logo = new Image();
      logo.crossOrigin = 'anonymous'; // Allow cross-origin loading
      await new Promise((resolve, reject) => {
        logo.onload = resolve;
        logo.onerror = (error) => {
          console.warn('Logo failed to load:', error);
          resolve(null); // Continue without logo if it fails
        };
        logo.src = logoUrl || logoImage;
      });

      const logoSize = Math.floor(qrSize * 0.2);
      const logoX = (qrSize - logoSize) / 2;
      const logoY = (qrSize - logoSize) / 2;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
    } catch (error) {
      console.warn('Could not add logo to QR code:', error);
      // Continue without logo
    }

    return canvas.toDataURL();
  };

  const handlePrint = async () => {
    setIsGenerating(true);
    try {
      console.log('Starting QR code generation...');
      const qrImageDataUrl = await generateMultipleQRCodes();
      console.log('QR code generated, opening print window...');
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups for this site to print QR codes.');
        return;
      }
      
      const qrSizeMM = currentLayout.qrSize;
      const marginMM = 20;
      const spacingMM = 10;
      
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Codes - ${venueName}</title>
            <style>
              @page {
                size: A4;
                margin: ${marginMM}mm;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                background: white;
              }
              .print-container {
                width: 100%;
                height: 100vh;
                display: grid;
                grid-template-columns: repeat(${currentLayout.cols}, 1fr);
                grid-template-rows: repeat(${currentLayout.rows}, 1fr);
                gap: ${spacingMM}mm;
                align-items: center;
                justify-items: center;
              }
              .qr-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                page-break-inside: avoid;
              }
              .qr-code {
                width: ${qrSizeMM}mm;
                height: ${qrSizeMM}mm;
                margin-bottom: 8px;
              }
              .venue-info {
                max-width: ${qrSizeMM}mm;
              }
              .venue-name {
                font-size: ${Math.max(10, Math.floor(qrSizeMM / 8))}px;
                font-weight: bold;
                margin-bottom: 4px;
                color: #333;
                word-wrap: break-word;
              }
              .instructions {
                font-size: ${Math.max(8, Math.floor(qrSizeMM / 12))}px;
                color: #666;
                margin-bottom: 6px;
              }
              .url {
                font-size: ${Math.max(6, Math.floor(qrSizeMM / 16))}px;
                color: #999;
                word-break: break-all;
                line-height: 1.2;
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${Array.from({ length: currentLayout.codesPerPage }, (_, i) => `
                <div class="qr-item">
                  <img src="${qrImageDataUrl}" alt="QR Code" class="qr-code" />
                  <div class="venue-info">
                    <div class="venue-name">${venueName}</div>
                    <div class="instructions">Scan to request music</div>
                    <div class="url">${qrUrl}</div>
                  </div>
                </div>
              `).join('')}
            </div>
            <script>
              console.log('Print window loaded');
              window.onload = function() {
                console.log('Window onload triggered');
                setTimeout(() => {
                  console.log('Triggering print dialog');
                  window.print();
                  window.onafterprint = function() {
                    console.log('Print dialog closed');
                    window.close();
                  };
                }, 1000);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      console.log('Print window created successfully');
    } catch (error) {
      console.error('Error generating print version:', error);
      alert(`Error generating QR codes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">QR-kod</CardTitle>
        <CardDescription className="text-xs">Låt gäster scanna för att begära musik</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* QR Code Preview - Compact */}
          <div className="flex-shrink-0">
            <div className="bg-white p-3 rounded-lg shadow-sm border">
              <canvas 
                ref={canvasRef}
                className="w-32 h-32 rounded"
              />
            </div>
          </div>

          {/* Controls - Compact */}
          <div className="flex-1 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="layout-select" className="text-xs font-medium">
                Layout
              </Label>
              <Select value={selectedLayout} onValueChange={setSelectedLayout}>
                <SelectTrigger id="layout-select" className="h-8 text-sm">
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  {layoutOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-sm">
                      {option.label} - {option.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handlePrint} 
              className="w-full h-8 text-sm"
              disabled={isGenerating}
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              {isGenerating ? 'Generating...' : `Print ${currentLayout.codesPerPage}`}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              {currentLayout.codesPerPage} koder ({currentLayout.description})
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;