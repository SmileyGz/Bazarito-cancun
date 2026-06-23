import fs from 'fs';
import { parse } from 'csv-parse/sync';

async function run() {
  console.log('Reading CSV...');
  const csvContent = fs.readFileSync('/Users/josegonzalez/.gemini/antigravity/brain/fd6bdeb4-093c-486a-b5a4-807576946a2b/.system_generated/steps/30/content.md', 'utf8');
  
  const parts = csvContent.split('---');
  const rawCsv = parts.length > 1 ? parts[1].trim() : csvContent.trim();
  
  const records = parse(rawCsv, { skip_empty_lines: true, relax_column_count: true });
  
  let headerIndex = -1;
  for(let i=0; i<5; i++) {
    if(records[i] && records[i][0] === 'CATEGORIA ') {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    console.error("Could not find header row");
    return;
  }

  let currentProductName = null;
  let currentAds = [];
  let allProductsData = [];

  for(let i = headerIndex + 1; i < records.length; i++) {
    const row = records[i];
    const category = row[0]?.trim();
    if (!category) continue;
    
    const copy = row[11]?.trim() || '';
    const priceStr = row[12]?.trim() || '';
    const desc = row[13]?.trim() || '';
    
    let assignedProfile = 'Unassigned';
    if (row[1] || row[2]) assignedProfile = 'JG';
    else if (row[3] || row[4]) assignedProfile = 'L';
    else if (row[5] || row[6]) assignedProfile = 'J';
    else if (row[7] || row[8]) assignedProfile = 'B';
    else if (row[9] || row[10]) assignedProfile = 'A';
    
    if (desc.length > 20) {
      if (currentAds.length > 0) {
        allProductsData.push({ name: currentProductName, ads: currentAds });
      }
      currentProductName = Array.from(copy).slice(0, 30).join('') + "...";
      const firstLine = desc.split('\\n')[0].replace(/[^a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ]/g, '').trim();
      if (firstLine.length > 5 && firstLine.length < 50) currentProductName = firstLine;
      
      currentAds = [];
    }

    if (category && (copy || desc)) {
      currentAds.push({
        id: crypto.randomUUID(),
        category,
        copy,
        priceStr,
        description: desc || (currentAds.length > 0 ? currentAds[0].description : ''),
        profile: assignedProfile,
        status: 'pending'
      });
    }
  }

  if (currentAds.length > 0) {
    allProductsData.push({ name: currentProductName, ads: currentAds });
  }

  console.log(`Found ${allProductsData.length} products to migrate.`);
  
  fs.writeFileSync('src/data/legacy-ads.json', JSON.stringify(allProductsData, null, 2));
  console.log('✅ Successfully wrote legacy ads to src/data/legacy-ads.json');
}

run().catch(console.error);
