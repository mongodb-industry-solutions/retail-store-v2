import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const invoiceUrl = process.env.GCP_INVOICE_URL;
    
    if (!invoiceUrl) {
      return NextResponse.json(
        { error: 'Invoice URL not configured' },
        { status: 500 }
      );
    }
    return NextResponse.json({ invoiceUrl });
  } catch (error) {
    console.error('Error fetching invoice URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}