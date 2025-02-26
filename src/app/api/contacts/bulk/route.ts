import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getCurrentUserData } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

// POST /api/contacts/bulk - Perform bulk actions on contacts
export async function POST(req: NextRequest) {
  try {
    const clerkId = await getCurrentUser();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userData = await getCurrentUserData();
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.action || !body.contactIds || !Array.isArray(body.contactIds) || body.contactIds.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid request. Action and contactIds array are required' 
      }, { status: 400 });
    }
    
    const { action, contactIds } = body;
    
    // Verify all contacts belong to the user
    const { data: userContacts, error: fetchError } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('user_id', userData.id)
      .in('id', contactIds);
    
    if (fetchError) {
      console.error('Error fetching contacts:', fetchError);
      return NextResponse.json({ error: 'Failed to verify contacts' }, { status: 500 });
    }
    
    // Check if all requested contacts belong to the user
    const userContactIds = userContacts?.map(contact => contact.id) || [];
    const invalidContactIds = contactIds.filter((id: string) => !userContactIds.includes(id));
    
    if (invalidContactIds.length > 0) {
      return NextResponse.json({ 
        error: 'Some contacts do not exist or do not belong to you',
        invalidContactIds
      }, { status: 403 });
    }
    
    let result;
    
    // Perform the requested action
    switch (action) {
      case 'activate':
        result = await supabaseAdmin
          .from('contacts')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userData.id)
          .in('id', contactIds);
        break;
        
      case 'deactivate':
        result = await supabaseAdmin
          .from('contacts')
          .update({ 
            status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userData.id)
          .in('id', contactIds);
        break;
        
      case 'delete':
        result = await supabaseAdmin
          .from('contacts')
          .delete()
          .eq('user_id', userData.id)
          .in('id', contactIds);
        break;
        
      default:
        return NextResponse.json({ 
          error: 'Invalid action. Supported actions: activate, deactivate, delete' 
        }, { status: 400 });
    }
    
    if (result.error) {
      console.error(`Error performing ${action} action:`, result.error);
      return NextResponse.json({ 
        error: `Failed to ${action} contacts`,
        details: result.error
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: `Successfully performed ${action} on ${contactIds.length} contacts`,
      affectedIds: contactIds
    });
  } catch (error) {
    console.error('Error in contacts bulk action route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 