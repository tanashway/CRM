'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

export default function LocalizationSettingsPage() {
  const [dateFormat, setDateFormat] = useState('m/d/Y');
  const [timeFormat, setTimeFormat] = useState('24 hours');
  const [timezone, setTimezone] = useState('America/Chicago');
  const [language, setLanguage] = useState('English');
  const [disableLanguages, setDisableLanguages] = useState('no');
  const [outputClientPDF, setOutputClientPDF] = useState('no');
  const [loading, setLoading] = useState(false);
  
  const handleSave = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Localization settings saved successfully');
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Localization</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Configure regional settings and language preferences.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Regional Settings</CardTitle>
          <CardDescription>
            Configure date, time, and regional preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="date-format">Date Format</Label>
            <Select value={dateFormat} onValueChange={setDateFormat}>
              <SelectTrigger id="date-format" className="w-full">
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="m/d/Y">m/d/Y</SelectItem>
                <SelectItem value="d/m/Y">d/m/Y</SelectItem>
                <SelectItem value="Y-m-d">Y-m-d</SelectItem>
                <SelectItem value="M d, Y">M d, Y</SelectItem>
                <SelectItem value="d M, Y">d M, Y</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time-format">Time Format</Label>
            <Select value={timeFormat} onValueChange={setTimeFormat}>
              <SelectTrigger id="time-format" className="w-full">
                <SelectValue placeholder="Select time format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24 hours">24 hours</SelectItem>
                <SelectItem value="12 hours">12 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="default-timezone">Default Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="default-timezone" className="w-full">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Chicago">America/Chicago</SelectItem>
                <SelectItem value="America/New_York">America/New_York</SelectItem>
                <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                <SelectItem value="Europe/London">Europe/London</SelectItem>
                <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="default-language">Default Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="default-language" className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="German">German</SelectItem>
                <SelectItem value="Chinese">Chinese</SelectItem>
                <SelectItem value="Japanese">Japanese</SelectItem>
                <SelectItem value="Arabic">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Language Options</CardTitle>
          <CardDescription>
            Configure language settings for your application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Disable Languages</Label>
            <RadioGroup value={disableLanguages} onValueChange={setDisableLanguages} className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="disable-yes" />
                <Label htmlFor="disable-yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="disable-no" />
                <Label htmlFor="disable-no" className="cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-3">
            <Label className="flex items-center">
              <span className="mr-2">ⓘ</span>
              Output client PDF documents from admin area in client language
            </Label>
            <RadioGroup value={outputClientPDF} onValueChange={setOutputClientPDF} className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="output-yes" />
                <Label htmlFor="output-yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="output-no" />
                <Label htmlFor="output-no" className="cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 