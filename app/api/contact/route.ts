import { NextResponse } from 'next/server';
// 💡 1. IMPORT the secure server client adjusted in lib/supabaseClient.js
import { supabaseServer } from '@/lib/supaBaseServer'; 

// 🚨 Define the name of your contact submissions table
const CONTACT_TABLE_NAME = 'contact_submission'; 

export async function POST(request: Request) {
  try {
    const formData = await request.json();

    // 2. Use the secure server client (supabaseServer) for the direct INSERT
    const { data, error } = await supabaseServer
      .from(CONTACT_TABLE_NAME)
      .insert([
        {
          name: formData.name,
          email: formData.email,
          company: formData.company,
          message: formData.message,
          // You can add timestamp columns here if not handled by Supabase defaults
        },
      ])
      .select(); // Use .select() to return the inserted record

    if (error) {
      console.error(`Supabase Insert Error into ${CONTACT_TABLE_NAME}:`, error);
      // Return a 400 Bad Request for database errors
      return NextResponse.json({ 
          message: 'Database error occurred during submission.', 
          error: error.message 
      }, { status: 400 });
    }

    // 3. Success response
    return NextResponse.json({
      message: 'Submission saved successfully!',
      record: data[0] // Return the inserted record
    }, { status: 200 });

  } catch (error) {
    console.error('API Error processing form data:', error);
    // Return a 500 Internal Server Error for code/processing errors
    return NextResponse.json({
      message: 'Failed to process request due to a server error.',
      error: (error as Error).message
    }, { status: 500 });
  }
}