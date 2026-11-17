export const districtNames: Record<string, string> = { Jerusalem: 'ירושלים', North: 'צפון', South: 'דרום', Haifa: 'חיפה', Center: 'מרכז', 'Tel Aviv': 'תל אביב', 'Judea & Samaria': 'יהודה ושומרון', Other: 'אחר' }
export const districtOptions = [{ value: '', label: 'הכל' }, ...Object.entries(districtNames).map(([value, label]) => ({ value, label }))]
export const technologyOptions = [{ value: '', label: 'הכל' }, { value: 'Photovoltaic', label: 'פוטו וולטאי' }, { value: 'Wind', label: 'רוח' }, { value: 'Solar Thermal', label: 'תרמו סולארי' }, { value: 'Other', label: 'אחר' }]
