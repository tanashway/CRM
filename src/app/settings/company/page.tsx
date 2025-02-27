'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function CompanySettingsPage() {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Sela Group',
    email: 'contact@selagroup.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Ave, Suite 100, San Francisco, CA 94107',
    website: 'https://selagroup.com',
    taxId: 'US123456789',
    description: 'Sela Group is a leading provider of business management solutions for small and medium-sized enterprises.'
  });
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Company information saved successfully');
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Company Information</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your company details and information.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>
            Update your company's basic information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input 
                id="company-name" 
                name="name"
                value={companyInfo.name} 
                onChange={handleChange} 
                placeholder="Enter company name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-email">Email Address</Label>
              <Input 
                id="company-email" 
                name="email"
                type="email"
                value={companyInfo.email} 
                onChange={handleChange} 
                placeholder="Enter company email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-phone">Phone Number</Label>
              <Input 
                id="company-phone" 
                name="phone"
                value={companyInfo.phone} 
                onChange={handleChange} 
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-website">Website</Label>
              <Input 
                id="company-website" 
                name="website"
                value={companyInfo.website} 
                onChange={handleChange} 
                placeholder="Enter website URL"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-tax-id">Tax ID / VAT Number</Label>
              <Input 
                id="company-tax-id" 
                name="taxId"
                value={companyInfo.taxId} 
                onChange={handleChange} 
                placeholder="Enter tax ID or VAT number"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-address">Address</Label>
            <Textarea 
              id="company-address" 
              name="address"
              value={companyInfo.address} 
              onChange={handleChange} 
              placeholder="Enter company address"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-description">Company Description</Label>
            <Textarea 
              id="company-description" 
              name="description"
              value={companyInfo.description} 
              onChange={handleChange} 
              placeholder="Enter company description"
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
          <CardDescription>
            Upload your company logo for invoices and other documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-24 w-24 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
              <span className="text-slate-500 dark:text-slate-400">Logo</span>
            </div>
            <div className="space-y-2">
              <Button variant="outline">Upload Logo</Button>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Recommended size: 200x200px. Max file size: 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 