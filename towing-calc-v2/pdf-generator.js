// PDF Generation Module using jsPDF
// This will be loaded via CDN in HTML

class PDFGenerator {
    constructor() {
        this.doc = null;
        this.companyInfo = this.getCompanyInfo();
    }

    getCompanyInfo() {
        return {
            name: localStorage.getItem('companyName') || 'MH AUTO',
            phone: localStorage.getItem('companyPhone') || '061 453 2160',
            email: localStorage.getItem('companyEmail') || 'info@mhauto.co.za',
            address: localStorage.getItem('companyAddress') || '784 Gopalall Hurbans, Tongaat, KZN',
            vatNumber: localStorage.getItem('vatNumber') || '',
            regNumber: localStorage.getItem('regNumber') || ''
        };
    }

    async generateQuotePDF(quoteData) {
        const { jsPDF } = window.jspdf;
        this.doc = new jsPDF();

        // Add logo if available
        await this.addLogo();

        // Company Header
        this.addCompanyHeader();

        // Quote Title
        this.doc.setFontSize(20);
        this.doc.setTextColor(255, 107, 53);
        this.doc.text('QUOTATION', 105, 60, { align: 'center' });

        // Quote Number and Date
        this.doc.setFontSize(10);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(`Quote #: ${quoteData.quoteNumber || 'Q-' + Date.now()}`, 20, 70);
        this.doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 75);

        // Customer Information
        this.doc.setFontSize(12);
        this.doc.setFont(undefined, 'bold');
        this.doc.text('Customer Information:', 20, 90);
        this.doc.setFont(undefined, 'normal');
        this.doc.setFontSize(10);
        if (quoteData.customerName) {
            this.doc.text(`Name: ${quoteData.customerName}`, 20, 97);
        }
        if (quoteData.customerPhone) {
            this.doc.text(`Phone: ${quoteData.customerPhone}`, 20, 102);
        }

        // Service Details
        let yPos = 115;
        this.doc.setFontSize(12);
        this.doc.setFont(undefined, 'bold');
        this.doc.text('Service Details:', 20, yPos);
        yPos += 7;

        this.doc.setFont(undefined, 'normal');
        this.doc.setFontSize(10);
        this.doc.text(`From: ${quoteData.startLocation}`, 20, yPos);
        yPos += 5;
        this.doc.text(`To: ${quoteData.endLocation}`, 20, yPos);
        yPos += 5;
        this.doc.text(`Distance: ${quoteData.distance} km`, 20, yPos);
        yPos += 5;
        this.doc.text(`Vehicle Type: ${quoteData.vehicleType}`, 20, yPos);
        yPos += 10;

        // Cost Breakdown Table
        this.addCostBreakdownTable(quoteData, yPos);

        // Payment Information
        yPos = 220;
        this.addPaymentInfo(yPos);

        // Terms & Conditions
        yPos = 250;
        this.addTermsAndConditions(yPos);

        // Footer
        this.addFooter();

        // Generate QR Code for payment
        if (quoteData.paymentLink) {
            await this.addQRCode(quoteData.paymentLink, 160, 220);
        }

        return this.doc;
    }

    async addLogo() {
        // Try to load logo from localStorage or file
        const logoData = localStorage.getItem('companyLogo');
        if (logoData) {
            try {
                this.doc.addImage(logoData, 'PNG', 20, 10, 30, 30);
            } catch (e) {
                console.log('Could not add logo to PDF');
            }
        }
    }

    addCompanyHeader() {
        this.doc.setFontSize(16);
        this.doc.setFont(undefined, 'bold');
        this.doc.text(this.companyInfo.name, 60, 20);
        
        this.doc.setFontSize(9);
        this.doc.setFont(undefined, 'normal');
        this.doc.text(this.companyInfo.phone, 60, 27);
        this.doc.text(this.companyInfo.email, 60, 32);
        this.doc.text(this.companyInfo.address, 60, 37);
    }

    addCostBreakdownTable(quoteData, startY) {
        const items = [];
        
        // Base cost
        items.push(['Base Towing Cost', `R ${quoteData.baseCost.toFixed(2)}`]);
        
        // Additional items
        if (quoteData.surcharge > 0) {
            items.push([`Time Surcharge (${quoteData.surchargePercent}%)`, `R ${quoteData.surcharge.toFixed(2)}`]);
        }
        
        if (quoteData.winchingCost > 0) {
            items.push(['Winching Service', `R ${quoteData.winchingCost.toFixed(2)}`]);
        }
        
        if (quoteData.additionalCharges && quoteData.additionalCharges.length > 0) {
            quoteData.additionalCharges.forEach(charge => {
                items.push([charge.description, `R ${charge.amount.toFixed(2)}`]);
            });
        }
        
        // Subtotal
        items.push(['', '']);
        items.push(['Subtotal', `R ${quoteData.subtotal.toFixed(2)}`]);
        
        // Discount
        if (quoteData.discount > 0) {
            items.push(['Discount', `-R ${quoteData.discount.toFixed(2)}`]);
        }
        
        // VAT if applicable
        const vatRate = parseFloat(localStorage.getItem('vatRate') || 15);
        if (vatRate > 0) {
            const vatAmount = (quoteData.total * vatRate) / (100 + vatRate);
            items.push([`VAT (${vatRate}%)`, `R ${vatAmount.toFixed(2)}`]);
        }
        
        // Total
        items.push(['', '']);
        this.doc.setFont(undefined, 'bold');
        items.push(['TOTAL', `R ${quoteData.total.toFixed(2)}`]);

        // Draw table
        let y = startY;
        items.forEach((item, index) => {
            if (item[0] === '' && item[1] === '') {
                // Separator line
                this.doc.line(20, y, 190, y);
                y += 5;
            } else {
                const isBold = item[0] === 'TOTAL' || item[0] === 'Subtotal';
                this.doc.setFont(undefined, isBold ? 'bold' : 'normal');
                this.doc.text(item[0], 20, y);
                this.doc.text(item[1], 190, y, { align: 'right' });
                y += 7;
            }
        });
    }

    addPaymentInfo(startY) {
        this.doc.setFontSize(12);
        this.doc.setFont(undefined, 'bold');
        this.doc.text('Payment Information:', 20, startY);
        
        this.doc.setFontSize(9);
        this.doc.setFont(undefined, 'normal');
        
        const bankName = localStorage.getItem('bankName');
        const accountNumber = localStorage.getItem('bankAccount');
        const branchCode = localStorage.getItem('branchCode');
        
        let y = startY + 7;
        if (bankName) {
            this.doc.text(`Bank: ${bankName}`, 20, y);
            y += 5;
        }
        if (accountNumber) {
            this.doc.text(`Account: ${accountNumber}`, 20, y);
            y += 5;
        }
        if (branchCode) {
            this.doc.text(`Branch Code: ${branchCode}`, 20, y);
            y += 5;
        }
        
        const paymentTerms = localStorage.getItem('paymentTerms') || '7';
        this.doc.text(`Payment Terms: ${paymentTerms} days`, 20, y);
    }

    addTermsAndConditions(startY) {
        this.doc.setFontSize(8);
        this.doc.setFont(undefined, 'bold');
        this.doc.text('Terms & Conditions:', 20, startY);
        
        this.doc.setFont(undefined, 'normal');
        const terms = [
            '1. This quotation is valid for 30 days from the date of issue.',
            '2. Payment is due within the specified payment terms.',
            '3. Additional charges may apply for waiting time or difficult recoveries.',
            '4. Prices include standard towing services only.',
            '5. Customer is responsible for securing personal belongings.'
        ];
        
        let y = startY + 5;
        terms.forEach(term => {
            this.doc.text(term, 20, y);
            y += 4;
        });
    }

    addFooter() {
        const footer = localStorage.getItem('invoiceFooter') || 'Thank you for choosing MH AUTO!';
        this.doc.setFontSize(9);
        this.doc.setTextColor(100, 100, 100);
        this.doc.text(footer, 105, 285, { align: 'center' });
    }

    async addQRCode(data, x, y) {
        try {
            const qrDataUrl = await QRCode.toDataURL(data, { width: 60 });
            this.doc.addImage(qrDataUrl, 'PNG', x, y, 30, 30);
            this.doc.setFontSize(8);
            this.doc.text('Scan to Pay', x + 15, y + 35, { align: 'center' });
        } catch (e) {
            console.log('Could not generate QR code');
        }
    }

    save(filename) {
        this.doc.save(filename);
    }

    getBlob() {
        return this.doc.output('blob');
    }

    getDataUrl() {
        return this.doc.output('dataurlstring');
    }
}

// Export for use in main app
window.PDFGenerator = PDFGenerator;
