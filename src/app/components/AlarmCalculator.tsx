"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AlarmCalculator() {
  // Alarm to DB conversion
  const [alarmNumber, setAlarmNumber] = useState('');
  const [result, setResult] = useState<{
    dbAddress: string;
    calculation: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // DB to Alarm conversion
  const [dbAddress, setDbAddress] = useState('');
  const [dbType, setDbType] = useState<'840D' | '828D'>('840D');
  const [reverseResult, setReverseResult] = useState<{
    alarmNumber: string;
    calculation: string;
  } | null>(null);
  const [reverseError, setReverseError] = useState<string | null>(null);

  const calculateDBAddress = (alarm: string) => {
    // Validate input
    if (!alarm || !/^70\d{4}$/.test(alarm)) {
      setError('Please enter a valid alarm number (format: 70XXXX)');
      setResult(null);
      return;
    }

    const alarmNum = parseInt(alarm);
    
    // Check if it's a Siemens 840DPLC user alarm (700000-799999)
    if (alarmNum >= 700000 && alarmNum <= 799999) {
      // Extract middle two digits and last two digits
      const middleDigits = parseInt(alarm.substring(2, 4));
      const lastDigits = parseInt(alarm.substring(4, 6));
      
      // Calculate according to the formula
      const initialPoint = 180;
      const middleCalculation = middleDigits * 8;
      const quotient = Math.floor(lastDigits / 8);
      const remainder = lastDigits % 8;
      
      const dbxValue = initialPoint + middleCalculation + quotient;
      const dbAddress = `DB2.DBX${dbxValue}.${remainder}`;
      
      const calculation = `${initialPoint} + (${middleDigits} × 8) + (${lastDigits} ÷ 8) = ${initialPoint} + ${middleCalculation} + ${quotient}.${remainder} = ${dbxValue}.${remainder}`;
      
      setResult({
        dbAddress,
        calculation
      });
      setError(null);
    } 
    // Check if it's a Siemens 828D PLC user alarm (700000-700247)
    else if (alarmNum >= 700000 && alarmNum <= 700247) {
      // For 828D, calculate the bit position in DB1600
      const offset = alarmNum - 700000;
      const byteOffset = Math.floor(offset / 8);
      const bitOffset = offset % 8;
      
      const dbAddress = `DB1600.DBX${byteOffset}.${bitOffset}`;
      const calculation = `Alarm ${alarmNum} corresponds to bit position ${offset} in DB1600, which is byte ${byteOffset}, bit ${bitOffset}`;
      
      setResult({
        dbAddress,
        calculation
      });
      setError(null);
    } else {
      setError('Alarm number out of valid range');
      setResult(null);
    }
  };

  const calculateAlarmNumber = (db: string) => {
    setReverseError(null);
    
    // Parse DB address
    let match;
    
    if (dbType === '840D') {
      // For 840D: DB2.DBX{offset}.{bit}
      match = db.match(/^DB2\.DBX(\d+)\.(\d+)$/i);
      
      if (!match) {
        setReverseError('Invalid DB2 format. Use format: DB2.DBX{offset}.{bit}');
        setReverseResult(null);
        return;
      }
      
      const dbxOffset = parseInt(match[1]);
      const bitOffset = parseInt(match[2]);
      
      if (dbxOffset < 180) {
        setReverseError('DBX offset must be at least 180 for 840D alarms');
        setReverseResult(null);
        return;
      }
      
      if (bitOffset > 7) {
        setReverseError('Bit offset must be between 0-7');
        setReverseResult(null);
        return;
      }
      
      // Reverse the calculation
      const initialPoint = 180;
      const remainingOffset = dbxOffset - initialPoint;
      
      // Calculate middle digits (divide by 8)
      const middleDigits = Math.floor(remainingOffset / 8);
      
      // Calculate last digits
      const quotient = remainingOffset % 8;
      const lastDigits = quotient * 8 + bitOffset;
      
      // Format the alarm number
      const alarmNumber = `70${middleDigits.toString().padStart(2, '0')}${lastDigits.toString().padStart(2, '0')}`;
      
      const calculation = `Middle digits = (${dbxOffset} - ${initialPoint}) ÷ 8 = ${remainingOffset} ÷ 8 = ${middleDigits}\nLast digits = (${remainingOffset} % 8) × 8 + ${bitOffset} = ${quotient} × 8 + ${bitOffset} = ${lastDigits}`;
      
      setReverseResult({
        alarmNumber,
        calculation
      });
    } else {
      // For 828D: DB1600.DBX{byte}.{bit}
      match = db.match(/^DB1600\.DBX(\d+)\.(\d+)$/i);
      
      if (!match) {
        setReverseError('Invalid DB1600 format. Use format: DB1600.DBX{byte}.{bit}');
        setReverseResult(null);
        return;
      }
      
      const byteOffset = parseInt(match[1]);
      const bitOffset = parseInt(match[2]);
      
      if (byteOffset > 30 || (byteOffset === 30 && bitOffset > 7)) {
        setReverseError('Address out of range for 828D alarms (max: DB1600.DBX30.7)');
        setReverseResult(null);
        return;
      }
      
      // Calculate alarm number
      const offset = byteOffset * 8 + bitOffset;
      const alarmNumber = 700000 + offset;
      
      if (alarmNumber > 700247) {
        setReverseError('Calculated alarm number exceeds valid range (700000-700247)');
        setReverseResult(null);
        return;
      }
      
      const calculation = `Alarm offset = ${byteOffset} × 8 + ${bitOffset} = ${offset}\nAlarm number = 700000 + ${offset} = ${alarmNumber}`;
      
      setReverseResult({
        alarmNumber: alarmNumber.toString(),
        calculation
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateDBAddress(alarmNumber);
  };

  const handleReverseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateAlarmNumber(dbAddress);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-3 sm:p-6 w-full max-w-full overflow-hidden">
      <Tabs defaultValue="alarm-to-db" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 max-w-full overflow-x-auto">
          <TabsTrigger value="alarm-to-db" className="text-xs sm:text-sm">Alarm → DB Address</TabsTrigger>
          <TabsTrigger value="db-to-alarm" className="text-xs sm:text-sm">DB Address → Alarm</TabsTrigger>
        </TabsList>
        
        <TabsContent value="alarm-to-db" className="space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Siemens Alarm Calculator</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4">Calculate DB address from Siemens alarm number</p>
            
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex flex-col gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={alarmNumber}
                    onChange={(e) => setAlarmNumber(e.target.value)}
                    placeholder="Enter alarm number (e.g., 701661)"
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white text-sm sm:text-base rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Calculate
                </button>
              </div>
              
              {error && (
                <p className="mt-2 text-xs sm:text-sm text-red-600">{error}</p>
              )}
            </form>
            
            {result && (
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                <h3 className="font-medium text-base sm:text-lg mb-2 sm:mb-3">Result</h3>
                
                <div className="space-y-3">
                  <div className="p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-base sm:text-lg font-mono font-semibold text-blue-800 break-words">{result.dbAddress}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">DB Address</p>
                  </div>
                  
                  <div className="p-2 sm:p-3 bg-gray-100 rounded-lg">
                    <p className="text-xs sm:text-sm font-medium">Calculation:</p>
                    <p className="text-xs sm:text-sm font-mono mt-1 break-words">{result.calculation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="db-to-alarm" className="space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2">DB to Alarm Converter</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4">Calculate Siemens alarm number from DB address</p>
            
            <form onSubmit={handleReverseSubmit} className="mb-6">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm sm:text-base">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="840d"
                      name="dbType"
                      checked={dbType === '840D'}
                      onChange={() => setDbType('840D')}
                      className="mr-2"
                    />
                    <label htmlFor="840d">840D (DB2)</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="828d"
                      name="dbType"
                      checked={dbType === '828D'}
                      onChange={() => setDbType('828D')}
                      className="mr-2"
                    />
                    <label htmlFor="828d">828D (DB1600)</label>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={dbAddress}
                      onChange={(e) => setDbAddress(e.target.value)}
                      placeholder={dbType === '840D' ? "Enter DB address (e.g., DB2.DBX315.5)" : "Enter DB address (e.g., DB1600.DBX10.3)"}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white text-sm sm:text-base rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Calculate
                  </button>
                </div>
                
                {reverseError && (
                  <p className="mt-2 text-xs sm:text-sm text-red-600">{reverseError}</p>
                )}
              </div>
            </form>
            
            {reverseResult && (
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                <h3 className="font-medium text-base sm:text-lg mb-2 sm:mb-3">Result</h3>
                
                <div className="space-y-3">
                  <div className="p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-base sm:text-lg font-mono font-semibold text-blue-800 break-words">{reverseResult.alarmNumber}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Alarm Number</p>
                  </div>
                  
                  <div className="p-2 sm:p-3 bg-gray-100 rounded-lg">
                    <p className="text-xs sm:text-sm font-medium">Calculation:</p>
                    <p className="text-xs sm:text-sm font-mono mt-1 whitespace-pre-line break-words">{reverseResult.calculation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 text-xs text-gray-500 border-t pt-4">
        <p className="mb-1">• For 840DPLC: User alarms (700000-799999) correspond to DB2</p>
        <p>• For 828D: User alarms (700000-700247) correspond to DB1600.DBX0.0-DB1600.DBX30.7</p>
      </div>
    </div>
  );
}