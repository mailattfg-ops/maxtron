import { supabase } from '../../../config/supabase';

export interface EInvoiceResponse {
  irn?: string;
  ack_no?: string;
  ack_date?: string;
  signed_invoice?: string;
  signed_qr_code?: string;
  status: 'GENERATED' | 'FAILED';
  error?: string;
  raw_response?: any;
}

export class EInvoiceService {
  private static getCredentials() {
    return {
      username: process.env.EINVOICE_PROD_USERNAME || process.env.MI_GSP_PROD_USERNAME || process.env.MI_GSP_USERNAME || '',
      password: process.env.EINVOICE_PROD_PASSWORD || process.env.MI_GSP_PROD_PASSWORD || process.env.MI_GSP_PASSWORD || '',
      gstin: process.env.EINVOICE_PROD_GSTIN || process.env.MI_GSP_PROD_GSTIN || process.env.MI_GSP_GSTIN || '',
      baseUrl: process.env.EINVOICE_PROD_BASE_URL || process.env.MI_GSP_PROD_BASE_URL || 'https://prod-api.mastersindia.co/api/v1',
      environment: 'production'
    };
  }

  public static isMockMode(): boolean {
    if (process.env.ENABLE_LIVE_EINVOICE !== 'true') {
      return true;
    }
    const creds = this.getCredentials();
    return !creds.username || !creds.password || !creds.gstin;
  }

  /**
   * Main method to generate E-Invoice (IRN) via Masters India GSP
   */
  public static async generateEInvoice(
    invoice: any,
    customer: any,
    items: any[]
  ): Promise<EInvoiceResponse> {
    try {
      // 1. Validation
      if (!customer.gst_no) {
        return {
          status: 'FAILED',
          error: 'E-Invoice can only be generated for B2B transactions. Customer GST No is missing.',
        };
      }

      // Check if Mock Mode
      if (this.isMockMode()) {
        const creds = this.getCredentials();
        console.log(`[EInvoiceService] Running in Mock Mode (${creds.environment}) for Invoice ${invoice.invoice_number}`);
        return this.simulateMockEInvoice(invoice);
      }

      const creds = this.getCredentials();

      // Step A: Authenticate with Masters India GSP to get JWT token
      console.log(`[EInvoiceService] Authenticating with Masters India Token API (${creds.environment}): ${creds.baseUrl}/token-auth/`);
      const authRes = await fetch(`${creds.baseUrl}/token-auth/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: creds.username,
          password: creds.password,
        }),
      });

      if (!authRes.ok) {
        const errText = await authRes.text();
        throw new Error(`Masters India authentication failed: ${errText}`);
      }

      const authData = await authRes.json();
      const token = authData.token;

      if (!token) {
        throw new Error(`Invalid response from Masters India GSP: missing auth token.`);
      }

      // Step B: Build standard e-Invoice schema payload (Version 1.1)
      const docNo = String(invoice.invoice_number || invoice.order_number || 'INV-0001').substring(0, 16);
      const docDate = invoice.invoice_date || invoice.order_date || new Date().toISOString();
      const totalAmount = Number(invoice.total_amount || invoice.total_value || 0);
      const taxAmount = invoice.tax_amount ? Number(invoice.tax_amount) : 0;
      const sellerGstin = creds.gstin || '32AUYPV8850B1Z2';
      const sellerStateCode = sellerGstin ? sellerGstin.substring(0, 2) : "32";
      const sellerLegalName = invoice.companies?.company_name === 'KEIL' ? "KEIL Industries Ltd." : "MAXTRON ASSOCIATES";
      const sellerPincode = sellerStateCode === "32" ? 678001 : 201301;
      const sellerLocation = sellerStateCode === "32" ? "Palakkad" : "Noida";

      const einvoicePayload = {
        user_gstin: sellerGstin,
        data_source: "erp",
        transaction_details: {
          supply_type: "B2B",
          charge_type: "N",
          igst_on_intra: "N",
          ecommerce_gstin: ""
        },
        document_details: {
          document_type: "INV",
          document_number: docNo, // Max 16 characters
          document_date: new Date(docDate).toLocaleDateString('en-GB') // "DD/MM/YYYY"
        },
        seller_details: {
          gstin: sellerGstin,
          legal_name: sellerLegalName,
          trade_name: sellerLegalName,
          address1: "Maxtron Industrial Area",
          address2: "Industrial Estate",
          location: sellerLocation,
          pincode: sellerPincode,
          state_code: sellerStateCode,
        },
        buyer_details: {
          gstin: customer.gst_no,
          legal_name: customer.customer_name,
          trade_name: customer.customer_name,
          address1: customer.addresses?.[0]?.street || "Customer Address",
          address2: "",
          location: customer.addresses?.[0]?.city || "Mumbai",
          pincode: parseInt(customer.addresses?.[0]?.zip_code) || 400001,
          place_of_supply: customer.gst_no ? customer.gst_no.substring(0, 2) : sellerStateCode, // First 2 digits of buyer GSTIN
          state_code: customer.gst_no ? customer.gst_no.substring(0, 2) : sellerStateCode,
        },
        value_details: {
          total_assessable_value: totalAmount,
          total_cgst_value: taxAmount / 2,
          total_sgst_value: taxAmount / 2,
          total_igst_value: 0,
          total_cess_value: 0,
          total_cess_value_of_state: 0,
          total_discount: 0,
          total_other_charge: 0,
          total_invoice_value: totalAmount + taxAmount,
          round_off_amount: 0,
          total_invoice_value_additional_currency: 0
        },
        item_list: items.map((item: any, idx: number) => {
          const itemVal = Number(item.amount);
          const itemGst = item.gst_amount ? Number(item.gst_amount) : 0;
          return {
            item_serial_number: (idx + 1).toString(),
            product_description: item.finished_products?.product_name || "Industrial Product",
            is_service: "N",
            hsn_code: item.finished_products?.hsn_code || "392011", // Default 6 digit HSN code
            bar_code: "",
            quantity: Number(item.quantity),
            free_quantity: 0,
            unit: "KGS",
            unit_price: Number(item.rate),
            total_amount: itemVal,
            pre_tax_value: 0,
            discount: 0,
            other_charge: 0,
            assessable_value: itemVal,
            gst_rate: Number(item.gst_percent || 18),
            igst_amount: 0,
            cgst_amount: itemGst / 2,
            sgst_amount: itemGst / 2,
            cess_rate: 0,
            cess_amount: 0,
            cess_nonadvol_amount: 0,
            state_cess_rate: 0,
            state_cess_amount: 0,
            state_cess_nonadvol_amount: 0,
            total_item_value: itemVal + itemGst
          };
        }),
      };

      console.log(`[EInvoiceService] Hitting Masters India E-Invoice API: ${creds.baseUrl}/einvoice/`);
      const apiRes = await fetch(`${creds.baseUrl}/einvoice/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${token}`,
        },
        body: JSON.stringify(einvoicePayload),
      });

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        throw new Error(`Masters India E-Invoice API failed with status ${apiRes.status}: ${errText}`);
      }

      const responseData = await apiRes.json();
      const result = responseData.results || responseData.data || responseData;
      const msg = result.message || result.data || result;

      const irn = msg.Irn || msg.irn || result.Irn || result.irn;
      const ackNo = (msg.AckNo || msg.ack_no || result.AckNo || result.ack_no)?.toString();
      const ackDt = msg.AckDt || msg.ack_date || msg.ack_dt || result.AckDt || result.ack_date;
      const signedInvoice = msg.SignedInvoice || msg.signed_invoice || result.SignedInvoice || result.signed_invoice;
      const signedQrCode = msg.SignedQRCode || msg.signed_qr_code || msg.SignedQrCode || result.SignedQRCode || result.signed_qr_code;

      const isSuccess = (result.status === 'Success' || responseData.success === true || responseData.status_cd === '1' || Boolean(irn));

      if (isSuccess && irn) {
        const successRes: EInvoiceResponse = {
          irn,
          ack_no: ackNo,
          ack_date: ackDt,
          signed_invoice: signedInvoice,
          signed_qr_code: signedQrCode,
          status: 'GENERATED',
          raw_response: responseData
        };

        console.log('\n================================================================================');
        console.log('⚡ [EInvoiceService] E-INVOICE GENERATED SUCCESSFULLY');
        console.log('--------------------------------------------------------------------------------');
        console.log(`Invoice Number   : ${invoice.invoice_number}`);
        console.log(`IRN              : ${irn}`);
        console.log(`Ack Number       : ${ackNo}`);
        console.log(`Ack Date         : ${ackDt}`);
        console.log(`Signed Invoice   : ${signedInvoice ? (signedInvoice.substring(0, 60) + '... (' + signedInvoice.length + ' chars)') : 'N/A'}`);
        console.log(`Signed QR Code   : ${signedQrCode ? (signedQrCode.substring(0, 60) + '... (' + signedQrCode.length + ' chars)') : 'N/A'}`);
        console.log('--------------------------------------------------------------------------------');
        console.log('Response Payload:');
        console.log(JSON.stringify({
          success: true,
          data: {
            Irn: irn,
            AckNo: ackNo,
            AckDt: ackDt,
            SignedInvoice: signedInvoice,
            SignedQRCode: signedQrCode
          }
        }, null, 2));
        console.log('================================================================================\n');

        return successRes;
      } else {
        const errorMsg = result.errorMessage || result.message || 'Unknown GSP error occurred';
        const errStr = typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg);

        console.error('\n❌ [EInvoiceService] E-Invoice Generation Failed from Masters India:', errStr);
        return {
          status: 'FAILED',
          error: errStr,
          raw_response: responseData
        };
      }
    } catch (error: any) {
      console.error('[EInvoiceService] Error in E-Invoice generation:', error);
      return {
        status: 'FAILED',
        error: `Connection error: ${error.message}`,
      };
    }
  }

  private static simulateMockEInvoice(invoice: any): EInvoiceResponse {
    // Generate a 64-character hex IRN string
    const irn = require('crypto').randomBytes(32).toString('hex');
    const ack_no = Math.floor(100000000000000 + Math.random() * 900000000000000).toString();
    const ack_date = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Generate realistic simulated SignedInvoice and SignedQRCode JWT tokens
    const mockHeader = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64');
    const mockPayload = Buffer.from(JSON.stringify({
      Irn: irn,
      AckNo: Number(ack_no),
      AckDt: ack_date,
      DocNo: invoice.invoice_number || 'INV-MOCK',
      TotInvVal: invoice.net_amount || invoice.total_amount || 0
    })).toString('base64');
    const mockSig = require('crypto').randomBytes(64).toString('base64url');

    const signed_invoice = `${mockHeader}.${mockPayload}.${mockSig}`;
    const signed_qr_code = `${mockHeader}.${mockPayload}.${mockSig}`;

    const res: EInvoiceResponse = {
      irn,
      ack_no,
      ack_date,
      signed_invoice,
      signed_qr_code,
      status: 'GENERATED',
      raw_response: {
        success: true,
        data: {
          Irn: irn,
          AckNo: ack_no,
          AckDt: ack_date,
          SignedInvoice: signed_invoice,
          SignedQRCode: signed_qr_code
        }
      }
    };

    console.log('\n================================================================================');
    console.log('⚡ [EInvoiceService] E-INVOICE GENERATION (SIMULATED MOCK MODE)');
    console.log('--------------------------------------------------------------------------------');
    console.log(`Invoice Number   : ${invoice.invoice_number}`);
    console.log(`IRN              : ${irn}`);
    console.log(`Ack Number       : ${ack_no}`);
    console.log(`Ack Date         : ${ack_date}`);
    console.log(`Signed Invoice   : ${signed_invoice.substring(0, 60)}... (${signed_invoice.length} chars)`);
    console.log(`Signed QR Code   : ${signed_qr_code.substring(0, 60)}... (${signed_qr_code.length} chars)`);
    console.log('--------------------------------------------------------------------------------');
    console.log('Response Payload:');
    console.log(JSON.stringify({
      success: true,
      data: {
        Irn: irn,
        AckNo: ack_no,
        AckDt: ack_date,
        SignedInvoice: signed_invoice,
        SignedQRCode: signed_qr_code
      }
    }, null, 2));
    console.log('================================================================================\n');

    return res;
  }

  /**
   * Cancel E-Invoice via Masters India
   */
  public static async cancelEInvoice(
    invoice: any,
    reasonCode: string,
    remarks: string
  ): Promise<{ status: 'CANCELLED' | 'FAILED'; error?: string }> {
    try {
      if (this.isMockMode()) {
        console.log(`[EInvoiceService] Simulating E-Invoice cancellation (Mock Mode) for Invoice ${invoice.invoice_number}`);
        return { status: 'CANCELLED' };
      }

      const creds = this.getCredentials();

      const authRes = await fetch(`${creds.baseUrl}/token-auth/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: creds.username,
          password: creds.password,
        }),
      });

      if (!authRes.ok) {
        const errText = await authRes.text();
        throw new Error(`Masters India authentication failed: ${errText}`);
      }

      const authData = await authRes.json();
      const token = authData.token;

      if (!token) {
        throw new Error(`Invalid response from Masters India GSP: missing auth token.`);
      }

      const cancelPayload = {
        user_gstin: creds.gstin,
        irn: invoice.einvoice_irn,
        cnl_rsn: reasonCode,
        cnl_rem: remarks,
      };

      console.log(`[EInvoiceService] Hitting Masters India Cancel E-Invoice API: ${creds.baseUrl}/einvoice/cancel/`);
      const apiRes = await fetch(`${creds.baseUrl}/einvoice/cancel/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${token}`,
        },
        body: JSON.stringify(cancelPayload),
      });

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        throw new Error(`Masters India E-Invoice Cancel API failed with status ${apiRes.status}: ${errText}`);
      }

      const responseData = await apiRes.json();
      const result = responseData.results;

      if (result.status === 'Success') {
        return {
          status: 'CANCELLED',
        };
      } else {
        const errorMsg = result.errorMessage || result.message || 'Unknown GSP error occurred during cancellation';
        return {
          status: 'FAILED',
          error: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
        };
      }
    } catch (error: any) {
      console.error('[EInvoiceService] Error in E-Invoice cancellation:', error);
      return {
        status: 'FAILED',
        error: `Connection error: ${error.message}`,
      };
    }
  }
}
