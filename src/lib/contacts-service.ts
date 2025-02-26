// Service for interacting with the contacts API

// Type definitions
export interface Contact {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  notes: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ContactFormData {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  notes?: string;
  status?: 'active' | 'inactive';
}

// Fetch all contacts
export async function getContacts(params?: {
  status?: string;
  search?: string;
}): Promise<Contact[]> {
  try {
    let url = '/api/contacts';
    
    // Add query parameters if provided
    if (params) {
      const queryParams = new URLSearchParams();
      
      if (params.status) {
        queryParams.append('status', params.status);
      }
      
      if (params.search) {
        queryParams.append('search', params.search);
      }
      
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch contacts');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
}

// Fetch a specific contact
export async function getContact(id: string): Promise<Contact> {
  try {
    const response = await fetch(`/api/contacts/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch contact');
    }
    
    return response.json();
  } catch (error) {
    console.error(`Error fetching contact ${id}:`, error);
    throw error;
  }
}

// Create a new contact
export async function createContact(data: ContactFormData): Promise<Contact> {
  try {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create contact');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
}

// Update an existing contact
export async function updateContact(id: string, data: ContactFormData): Promise<Contact> {
  try {
    const response = await fetch(`/api/contacts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update contact');
    }
    
    return response.json();
  } catch (error) {
    console.error(`Error updating contact ${id}:`, error);
    throw error;
  }
}

// Delete a contact
export async function deleteContact(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/contacts/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok && response.status !== 204) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete contact');
    }
  } catch (error) {
    console.error(`Error deleting contact ${id}:`, error);
    throw error;
  }
} 