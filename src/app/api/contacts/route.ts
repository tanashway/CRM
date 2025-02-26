import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/contacts - Get all contacts for the current user
export async function GET(req: NextRequest) {
  try {
    const clerkId = getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userData = await getCurrentUserData();
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    
    // Build query
    let query = supabaseAdmin
      .from('contacts')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });
    
    // Add filters if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching contacts:', error);
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in contacts GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/contacts - Create a new contact
export async function POST(req: NextRequest) {
  try {
    const clerkId = getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userData = await getCurrentUserData();
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.first_name) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    }
    
    // Create contact
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .insert({
        user_id: userData.id,
        first_name: body.first_name,
        last_name: body.last_name || '',
        email: body.email || '',
        phone: body.phone || '',
        company: body.company || '',
        position: body.position || '',
        notes: body.notes || '',
        status: body.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating contact:', error);
      return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in contacts POST route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 