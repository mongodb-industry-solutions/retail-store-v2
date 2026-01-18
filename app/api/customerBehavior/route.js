import { NextResponse } from 'next/server';
import { generateCustomerBehaviorData } from '@/lib/customerBehaviorGenerator';

export async function POST(request) {
  try {
    const { uid, sid, useDelay = false } = await request.json();

    // Validate required parameters
    if (!uid || !sid) {
      return NextResponse.json(
        { error: 'Missing required fields: uid and sid' },
        { status: 400 }
      );
    }

    console.log(`Generating customer behavior data for uid: ${uid}, sid: ${sid}`);

    // Generate customer behavior data using the converted script
    const results = await generateCustomerBehaviorData(uid, sid, useDelay);

    console.log(`Generated ${results.customerBehaviors.length} customer behaviors and ${results.nextBestActions.length} NBAs`);

    return NextResponse.json({
      success: true,
      message: `Generated customer behavior data for development mode`,
      data: results,
      summary: {
        customerBehaviors: results.customerBehaviors.length,
        nextBestActions: results.nextBestActions.length
      }
    });

  } catch (error) {
    console.error('Error generating customer behavior data:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return NextResponse.json(
    { 
      message: 'Customer Behavior API is running',
      available: process.env.DEVELOPMENT === 'true'
    },
    { status: 200 }
  );
}