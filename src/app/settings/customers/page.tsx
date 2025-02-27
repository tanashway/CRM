'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CustomerSettingsPage() {
  // Company field settings
  const [companyFieldRequired, setCompanyFieldRequired] = useState('yes');
  const [companyRequiresVAT, setCompanyRequiresVAT] = useState('no');
  
  // Registration settings
  const [allowCustomersToRegister, setAllowCustomersToRegister] = useState('yes');
  const [requireRegistrationConfirmation, setRequireRegistrationConfirmation] = useState('yes');
  const [allowPrimaryContactManageOthers, setAllowPrimaryContactManageOthers] = useState('yes');
  const [enableHoneypotSpamValidation, setEnableHoneypotSpamValidation] = useState('yes');
  
  // Contact permissions
  const [allowPrimaryContactViewBilling, setAllowPrimaryContactViewBilling] = useState('yes');
  const [contactsSeeOnlyOwnFiles, setContactsSeeOnlyOwnFiles] = useState('yes');
  const [allowContactsDeleteOwnFiles, setAllowContactsDeleteOwnFiles] = useState('yes');
  
  // Knowledge base settings
  const [useKnowledgeBase, setUseKnowledgeBase] = useState('yes');
  const [allowKnowledgeBaseWithoutRegistration, setAllowKnowledgeBaseWithoutRegistration] = useState('yes');
  const [showEstimateRequestLink, setShowEstimateRequestLink] = useState('yes');
  
  // Default contact permissions
  const [defaultPermissions, setDefaultPermissions] = useState({
    invoices: true,
    estimates: true,
    contracts: true,
    proposals: true,
    support: true,
    projects: true
  });
  
  // Customer information format
  const [customerInfoFormat, setCustomerInfoFormat] = useState('format1');
  
  const format1 = `{company_name}
      {street}
      {city} {state}
      {country_code} {zip_code}
      {vat_number_with_label}`;
      
  const format2 = `{company_name}, {customer_id}, {street}, {city}, {state}, {zip_code}, {country_code}, {country_name}, {phone}, {vat_number}, {vat_number_with_label}`;
  
  const [loading, setLoading] = useState(false);
  
  const handlePermissionChange = (permission: string, checked: boolean) => {
    setDefaultPermissions(prev => ({
      ...prev,
      [permission]: checked
    }));
  };
  
  const handleSave = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Customer settings saved successfully');
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customer Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Configure customer-related settings and permissions.
        </p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general" className="text-sm">General Settings</TabsTrigger>
          <TabsTrigger value="permissions" className="text-sm">Permissions</TabsTrigger>
          <TabsTrigger value="format" className="text-sm">Information Format</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Field Settings</CardTitle>
              <CardDescription>
                Configure company field requirements for customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Company field is required?</Label>
                <RadioGroup value={companyFieldRequired} onValueChange={setCompanyFieldRequired} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="company-required-yes" />
                    <Label htmlFor="company-required-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="company-required-no" />
                    <Label htmlFor="company-required-no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label>Company requires the usage of the VAT Number field</Label>
                <RadioGroup value={companyRequiresVAT} onValueChange={setCompanyRequiresVAT} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="company-vat-yes" />
                    <Label htmlFor="company-vat-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="company-vat-no" />
                    <Label htmlFor="company-vat-no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Registration Settings</CardTitle>
              <CardDescription>
                Configure customer registration options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Allow customers to register</Label>
                <RadioGroup value={allowCustomersToRegister} onValueChange={setAllowCustomersToRegister} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="allow-register-yes" />
                    <Label htmlFor="allow-register-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="allow-register-no" />
                    <Label htmlFor="allow-register-no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label>Require registration confirmation from administrator after customer register</Label>
                <RadioGroup value={requireRegistrationConfirmation} onValueChange={setRequireRegistrationConfirmation} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="require-confirmation-yes" />
                    <Label htmlFor="require-confirmation-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="require-confirmation-no" />
                    <Label htmlFor="require-confirmation-no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label>Enable Honeypot spam validation</Label>
                <RadioGroup value={enableHoneypotSpamValidation} onValueChange={setEnableHoneypotSpamValidation} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="honeypot-yes" />
                    <Label htmlFor="honeypot-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="honeypot-no" />
                    <Label htmlFor="honeypot-no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Settings</CardTitle>
              <CardDescription>
                Configure knowledge base options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Use Knowledge Base</Label>
                <RadioGroup value={useKnowledgeBase} onValueChange={setUseKnowledgeBase} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="knowledge-base-yes" />
                    <Label htmlFor="knowledge-base-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="knowledge-base-no" />
                    <Label htmlFor="knowledge-base-no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label>Allow knowledge base to be viewed without registration</Label>
                <RadioGroup value={allowKnowledgeBaseWithoutRegistration} onValueChange={setAllowKnowledgeBaseWithoutRegistration} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="kb-without-reg-yes" />
                    <Label htmlFor="kb-without-reg-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="kb-without-reg-no" />
                    <Label htmlFor="kb-without-reg-no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label>Show Estimate request link in customers area?</Label>
                <RadioGroup value={showEstimateRequestLink} onValueChange={setShowEstimateRequestLink} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="estimate-link-yes" />
                    <Label htmlFor="estimate-link-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="estimate-link-no" />
                    <Label htmlFor="estimate-link-no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Permissions</CardTitle>
              <CardDescription>
                Configure permissions for customer contacts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Allow primary contact to manage other customer contacts</Label>
                <RadioGroup value={allowPrimaryContactManageOthers} onValueChange={setAllowPrimaryContactManageOthers} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="manage-contacts-yes" />
                    <Label htmlFor="manage-contacts-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="manage-contacts-no" />
                    <Label htmlFor="manage-contacts-no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label>Allow primary contact to view/edit billing & shipping details</Label>
                <RadioGroup value={allowPrimaryContactViewBilling} onValueChange={setAllowPrimaryContactViewBilling} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="view-billing-yes" />
                    <Label htmlFor="view-billing-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="view-billing-no" />
                    <Label htmlFor="view-billing-no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label>Contacts see only own files uploaded in customer area</Label>
                <RadioGroup value={contactsSeeOnlyOwnFiles} onValueChange={setContactsSeeOnlyOwnFiles} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="own-files-yes" />
                    <Label htmlFor="own-files-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="own-files-no" />
                    <Label htmlFor="own-files-no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label>Allow contacts to delete own files uploaded from customers area</Label>
                <RadioGroup value={allowContactsDeleteOwnFiles} onValueChange={setAllowContactsDeleteOwnFiles} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="delete-files-yes" />
                    <Label htmlFor="delete-files-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="delete-files-no" />
                    <Label htmlFor="delete-files-no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Default Contact Permissions</CardTitle>
              <CardDescription>
                Set default permissions for new customer contacts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="invoices-permission" 
                    checked={defaultPermissions.invoices}
                    onCheckedChange={(checked) => handlePermissionChange('invoices', checked as boolean)}
                  />
                  <Label htmlFor="invoices-permission" className="cursor-pointer">Invoices</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="estimates-permission" 
                    checked={defaultPermissions.estimates}
                    onCheckedChange={(checked) => handlePermissionChange('estimates', checked as boolean)}
                  />
                  <Label htmlFor="estimates-permission" className="cursor-pointer">Estimates</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="contracts-permission" 
                    checked={defaultPermissions.contracts}
                    onCheckedChange={(checked) => handlePermissionChange('contracts', checked as boolean)}
                  />
                  <Label htmlFor="contracts-permission" className="cursor-pointer">Contracts</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="proposals-permission" 
                    checked={defaultPermissions.proposals}
                    onCheckedChange={(checked) => handlePermissionChange('proposals', checked as boolean)}
                  />
                  <Label htmlFor="proposals-permission" className="cursor-pointer">Proposals</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="support-permission" 
                    checked={defaultPermissions.support}
                    onCheckedChange={(checked) => handlePermissionChange('support', checked as boolean)}
                  />
                  <Label htmlFor="support-permission" className="cursor-pointer">Support</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="projects-permission" 
                    checked={defaultPermissions.projects}
                    onCheckedChange={(checked) => handlePermissionChange('projects', checked as boolean)}
                  />
                  <Label htmlFor="projects-permission" className="cursor-pointer">Projects</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="format" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information Format (PDF and HTML)</CardTitle>
              <CardDescription>
                Configure how customer information is displayed in documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="format1" 
                    id="format1" 
                    checked={customerInfoFormat === 'format1'}
                    onClick={() => setCustomerInfoFormat('format1')}
                  />
                  <Label htmlFor="format1" className="cursor-pointer">Format 1</Label>
                </div>
                <Textarea 
                  value={format1} 
                  readOnly 
                  className="font-mono text-sm bg-slate-50 dark:bg-slate-900"
                  rows={5}
                />
                
                <div className="flex items-center space-x-2 mt-6">
                  <RadioGroupItem 
                    value="format2" 
                    id="format2" 
                    checked={customerInfoFormat === 'format2'}
                    onClick={() => setCustomerInfoFormat('format2')}
                  />
                  <Label htmlFor="format2" className="cursor-pointer">Format 2</Label>
                </div>
                <Textarea 
                  value={format2} 
                  readOnly 
                  className="font-mono text-sm bg-slate-50 dark:bg-slate-900"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
} 