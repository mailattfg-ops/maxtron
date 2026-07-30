import { supabase } from '../../../config/supabase';

export interface EwbResponse {
  ewb_no?: string;
  ewb_date?: string;
  ewb_valid_till?: string;
  ewb_status: 'GENERATED' | 'FAILED';
  ewb_error?: string;
}

export class EwbService {
  private static getCredentials() {
    const env = (process.env.EWB_ENV || process.env.EINVOICE_ENV || 'sandbox').toLowerCase();
    const isProd = env === 'production' || env === 'prod';
    
    // Masters India GSP credentials
    if (isProd) {
      return {
        username: process.env.EWB_PROD_USERNAME || process.env.MI_GSP_PROD_USERNAME || process.env.MI_GSP_USERNAME || '',
        password: process.env.EWB_PROD_PASSWORD || process.env.MI_GSP_PROD_PASSWORD || process.env.MI_GSP_PASSWORD || '',
        gstin: process.env.EWB_PROD_GSTIN || process.env.MI_GSP_PROD_GSTIN || process.env.MI_GSP_GSTIN || '',
        baseUrl: process.env.EWB_PROD_BASE_URL || process.env.MI_GSP_PROD_BASE_URL || 'https://api.mastersindia.co/api/v1',
        environment: 'production'
      };
    } else {
      return {
        username: process.env.EWB_SANDBOX_USERNAME || process.env.MI_GSP_SANDBOX_USERNAME || process.env.MI_GSP_USERNAME || '',
        password: process.env.EWB_SANDBOX_PASSWORD || process.env.MI_GSP_SANDBOX_PASSWORD || process.env.MI_GSP_PASSWORD || '',
        gstin: process.env.EWB_SANDBOX_GSTIN || process.env.MI_GSP_SANDBOX_GSTIN || process.env.MI_GSP_GSTIN || '',
        baseUrl: process.env.EWB_SANDBOX_BASE_URL || process.env.MI_GSP_SANDBOX_BASE_URL || 'https://sandb-api.mastersindia.co/api/v1',
        environment: 'sandbox'
      };
    }
  }

  public static isMockMode(): boolean {
    if (process.env.ENABLE_LIVE_EWB !== 'true') {
      return true;
    }
    const creds = this.getCredentials();
    return !creds.username || !creds.password || !creds.gstin;
  }

  /**
   * Main method to generate E-Way Bill via Masters India GSP.
   */
  public static async generateEwb(
    invoice: any,
    customer: any,
    items: any[]
  ): Promise<EwbResponse> {
    try {
      // 1. Validation checks
      const transMode = invoice.trans_mode || '1';
      const vehicleNo = invoice.vehicle_no;
      
      if (transMode === '1' && !vehicleNo) {
        return {
          ewb_status: 'FAILED',
          ewb_error: 'Vehicle number is required for Road transport mode.',
        };
      }

      // Check if it's Mock Mode
      if (this.isMockMode()) {
        const creds = this.getCredentials();
        console.log(`[EwbService] Running in Mock Mode (${creds.environment}) for Invoice ${invoice.invoice_number || invoice.order_number}`);
        return this.simulateMockEwb(invoice);
      }

      const creds = this.getCredentials();
      
      // Step A: Authenticate with Masters India GSP to get JWT token
      console.log(`[EwbService] Authenticating with Masters India Token API (${creds.environment}): ${creds.baseUrl}/token-auth/`);
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

      // Step B: Build standard e-Way Bill request schema
      const docNo = String(invoice.invoice_number || invoice.order_number || 'INV-0001').substring(0, 16);
      const docDate = invoice.invoice_date || invoice.order_date || new Date().toISOString();
      const totalAmount = Number(invoice.total_amount || invoice.total_value || 0);
      const taxAmount = invoice.tax_amount ? Number(invoice.tax_amount) : 0;
      
      const ewbPayload = {
        userGstin: creds.gstin,
        supply_type: "outward",
        sub_supply_type: "Supply",
        sub_supply_description: "",
        document_type: "Tax Invoice",
        document_number: docNo,
        document_date: new Date(docDate).toLocaleDateString('en-GB'), // "DD/MM/YYYY" format
        gstin_of_consignor: creds.gstin,
        legal_name_of_consignor: "Maxtron Industries",
        address1_of_consignor: "Maxtron Industrial Area",
        address2_of_consignor: "Phase II",
        place_of_consignor: "Mumbai",
        pincode_of_consignor: 400001,
        state_of_consignor: "MAHARASHTRA",
        actual_from_state_name: "MAHARASHTRA",
        gstin_of_consignee: customer.gst_no || "URP", // URP for B2C Unregistered
        legal_name_of_consignee: customer.customer_name,
        address1_of_consignee: customer.addresses?.[0]?.street || "Customer Address",
        address2_of_consignee: "",
        place_of_consignee: customer.addresses?.[0]?.city || "Mumbai",
        pincode_of_consignee: parseInt(customer.addresses?.[0]?.zip_code) || 400001,
        state_of_supply: "MAHARASHTRA", // Set dynamically or fall back to default
        actual_to_state_name: "MAHARASHTRA",
        transaction_type: 1, // Regular
        other_value: 0,
        total_invoice_value: totalAmount + taxAmount,
        taxable_amount: totalAmount,
        cgst_amount: taxAmount / 2,
        sgst_amount: taxAmount / 2,
        igst_amount: 0,
        cess_amount: 0,
        cess_nonadvol_value: 0,
        transporter_id: invoice.transporter_id || "",
        transporter_name: invoice.transporter_name || "",
        transporter_document_number: invoice.trans_doc_no || "",
        transporter_document_date: invoice.trans_doc_date ? new Date(invoice.trans_doc_date).toLocaleDateString('en-GB') : "",
        transportation_mode: "Road", // "Road", "Rail", "Air", "Ship"
        transportation_distance: invoice.trans_distance ? Number(invoice.trans_distance) : 0, // 0 for auto-calculation
        vehicle_number: vehicleNo?.replace(/[^a-zA-Z0-9]/g, '')?.toUpperCase() || "",
        vehicle_type: invoice.vehicle_type === 'ODC' ? "ODC" : "Regular",
        generate_status: 1,
        data_source: "erp",
        user_ref: "",
        location_code: "",
        eway_bill_status: "Active",
        auto_print: "N",
        email: "",
        delete_record: "N",
        itemList: items.map((item: any) => ({
          product_name: item.finished_products?.product_name || "Industrial Product",
          product_description: item.finished_products?.product_name || "Industrial Product",
          hsn_code: item.finished_products?.hsn_code || "392011",
          quantity: Number(item.quantity),
          unit_of_product: "KGS",
          cgst_rate: Number(item.gst_percent || 18) / 2,
          sgst_rate: Number(item.gst_percent || 18) / 2,
          igst_rate: 0,
          cess_rate: 0,
          cessNonAdvol: 0,
          taxable_amount: Number(item.amount)
        }))
      };

      console.log(`[EwbService] Hitting Masters India E-Way Bill API: ${creds.baseUrl}/ewayBillsGenerate/`);
      const apiRes = await fetch(`${creds.baseUrl}/ewayBillsGenerate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${token}`,
        },
        body: JSON.stringify(ewbPayload)
      });

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        throw new Error(`Masters India E-Way Bill API failed with status ${apiRes.status}: ${errText}`);
      }

      const responseData = await apiRes.json();
      const result = responseData.results;

      if (result.status === 'Success' && result.message && result.message.ewayBillNo) {
        return {
          ewb_no: result.message.ewayBillNo?.toString(),
          ewb_date: result.message.ewayBillDate,
          ewb_valid_till: result.message.validUpto,
          ewb_status: 'GENERATED',
        };
      } else {
        const errorDetail = result.errorMessage || result.message || 'Unknown GSP error occurred';
        return {
          ewb_status: 'FAILED',
          ewb_error: typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail),
        };
      }
    } catch (error: any) {
      console.error('[EwbService] Error in E-Way Bill generation:', error);
      return {
        ewb_status: 'FAILED',
        ewb_error: `Connection error: ${error.message}`,
      };
    }
  }

  private static simulateMockEwb(invoice: any): EwbResponse {
    const random10Digits = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const ewbNo = `12${random10Digits}`;

    const now = new Date();
    const validityDays = Math.max(1, Math.ceil(Number(invoice.trans_distance || 100) / 100));
    const validTill = new Date();
    validTill.setDate(now.getDate() + validityDays);

    return {
      ewb_no: ewbNo,
      ewb_date: now.toISOString(),
      ewb_valid_till: validTill.toISOString(),
      ewb_status: 'GENERATED',
    };
  }
}
