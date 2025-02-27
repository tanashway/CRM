'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EmailSettingsPage() {
  const [activeTab, setActiveTab] = useState('smtp');
  const [mailEngine, setMailEngine] = useState('phpmailer');
  const [emailProtocol, setEmailProtocol] = useState('mail');
  const [email, setEmail] = useState('info@selagrp.com');
  const [emailCharset, setEmailCharset] = useState('utf-8');
  const [bccAllEmails, setBccAllEmails] = useState('');
  const [emailSignature, setEmailSignature] = useState('Mohamed Elzayyat');
  const [loading, setLoading] = useState(false);
  
  const predefinedHeader = `<!doctype html>
      <html>
      <head>
      <meta name="viewport" content="width=device-width" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <style>
      body {
        background-color: #f6f6f6;
        font-family: sans-serif;
        -webkit-font-smoothing: antialiased;
        font-size: 14px;
        line-height: 1.4;
        margin: 0;
        padding: 0;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }
      table {
        border-collapse: separate;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        width: 100%;
      }
      table td {
        font-family: sans-serif;
        font-size: 14px;
        vertical-align: top;
      }
      /* -------------------------------------
      BODY & CONTAINER
      ------------------------------------- */
      .body {
        background-color: #f6f6f6;
        width: 100%;
      }
      /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
      
      .container {
        display: block;
        margin: 0 auto !important;
        /* makes it centered */
        max-width: 680px;
        padding: 10px;
        width: 680px;
      }
      /* This should also be a block element, so that it will fill 100% of the .container */
      
      .content {
        box-sizing: border-box;
        display: block;
        margin: 0 auto;
        max-width: 680px;
        padding: 10px;
      }
      /* -------------------------------------
      HEADER, FOOTER, MAIN
      ------------------------------------- */
      
      .main {
        background: #fff;
        border-radius: 3px;
        width: 100%;
      }
      .wrapper {
        box-sizing: border-box;
        padding: 20px;
      }
      .footer {
        clear: both;
        padding-top: 10px;
        text-align: center;
        width: 100%;
      }
      .footer td,
      .footer p,
      .footer span,
      .footer a {
        color: #999999;
        font-size: 12px;
        text-align: center;
      }
      hr {
        border: 0;
        border-bottom: 1px solid #f6f6f6;
        margin: 20px 0;
      }
      /* -------------------------------------
      RESPONSIVE AND MOBILE FRIENDLY STYLES
      ------------------------------------- */
      
      @media only screen and (max-width: 620px) {
        table[class=body] .content {
          padding: 0 !important;
        }
        table[class=body] .container {
          padding: 0 !important;
          width: 100% !important;
        }
        table[class=body] .main {
          border-left-width: 0 !important;
          border-radius: 0 !important;
          border-right-width: 0 !important;
        }
      }
      </style>
      </head>
      <body class="">
      <table border="0" cellpadding="0" cellspacing="0" class="body">
      <tr>
      <td>&nbsp;</td>
      <td class="container">
      <div class="content">
      <!-- START CENTERED WHITE CONTAINER -->
      <table class="main">
      <!-- START MAIN CONTENT AREA -->
      <tr>
      <td class="wrapper">
      <table border="0" cellpadding="0" cellspacing="0">
      <tr>
      <td>`;
  
  const predefinedFooter = `</td>
      </tr>
      </table>
      </td>
      </tr>
      <!-- END MAIN CONTENT AREA -->
      </table>
      <!-- START FOOTER -->
      <div class="footer">
      <table border="0" cellpadding="0" cellspacing="0">
      <tr>
      <td class="content-block">
      <span>{companyname}</span>
      </td>
      </tr>
      </table>
      </div>
      <!-- END FOOTER -->
      <!-- END CENTERED WHITE CONTAINER -->
      </div>
      </td>
      <td>&nbsp;</td>
      </tr>
      </table>
      </body>
      </html>`;
  
  const handleSave = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Email settings saved successfully');
    }, 1000);
  };
  
  const handleSendTestEmail = () => {
    toast.info('Sending test email...');
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Test email sent successfully');
    }, 2000);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Email</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Configure email settings for your application.
        </p>
      </div>
      
      <Tabs defaultValue="smtp" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="smtp" className="text-sm">SMTP Settings</TabsTrigger>
          <TabsTrigger value="queue" className="text-sm">Email Queue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="smtp" className="space-y-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">SMTP Settings</h2>
            <span className="text-sm text-slate-500 ml-2">Setup main email</span>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Mail Engine</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={mailEngine} onValueChange={setMailEngine} className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phpmailer" id="phpmailer" />
                  <Label htmlFor="phpmailer" className="cursor-pointer">PHPMailer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="codeigniter" id="codeigniter" />
                  <Label htmlFor="codeigniter" className="cursor-pointer">CodeIgniter</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          
          <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The "mail" protocol is not the recommended protocol to send emails, you should strongly consider configuring the "SMTP" protocol to avoid any disruptions and delivery issues.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Email Protocol</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={emailProtocol} onValueChange={setEmailProtocol} className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="smtp" id="smtp" />
                  <Label htmlFor="smtp" className="cursor-pointer">SMTP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="microsoft" id="microsoft" />
                  <Label htmlFor="microsoft" className="cursor-pointer">Microsoft OAuth 2.0</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gmail" id="gmail" />
                  <Label htmlFor="gmail" className="cursor-pointer">Gmail OAuth 2.0</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sendmail" id="sendmail" />
                  <Label htmlFor="sendmail" className="cursor-pointer">Sendmail</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mail" id="mail" />
                  <Label htmlFor="mail" className="cursor-pointer">Mail</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email-charset">Email Charset</Label>
                <Input 
                  id="email-charset" 
                  value={emailCharset} 
                  onChange={(e) => setEmailCharset(e.target.value)} 
                  placeholder="Enter email charset"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bcc-all-emails">BCC All Emails To</Label>
                <Input 
                  id="bcc-all-emails" 
                  value={bccAllEmails} 
                  onChange={(e) => setBccAllEmails(e.target.value)} 
                  placeholder="Enter email address for BCC"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email-signature">Email Signature</Label>
                <Textarea 
                  id="email-signature" 
                  value={emailSignature} 
                  onChange={(e) => setEmailSignature(e.target.value)} 
                  placeholder="Enter email signature"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Predefined Header</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={predefinedHeader} 
                rows={10} 
                className="font-mono text-xs"
                readOnly
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Predefined Footer</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={predefinedFooter} 
                rows={10} 
                className="font-mono text-xs"
                readOnly
              />
            </CardContent>
          </Card>
          
          <div className="flex space-x-4">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={handleSendTestEmail}>
              Send Test Email
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="queue" className="space-y-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Email Queue</h2>
          </div>
          
          <Card>
            <CardContent className="py-10">
              <div className="text-center text-slate-500">
                <p>No emails in queue</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 