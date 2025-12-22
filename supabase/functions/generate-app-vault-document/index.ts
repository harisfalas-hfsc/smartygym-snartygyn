import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SECTION_TITLES: Record<string, string> = {
  identity: "Application Identity & Metadata",
  branding: "Branding & Visual Assets",
  pwa: "PWA Configuration",
  firebase: "Firebase & Push Notifications",
  apple: "Apple iOS Submission Requirements",
  google: "Google Play Store Submission Requirements",
  hosting: "Hosting & Infrastructure",
  ownership: "Ownership & Access",
  maintenance: "Maintenance & Updates",
};

function formatFieldLabel(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateDocxContent(title: string, sections: Record<string, any[]>): string {
  const now = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let bodyContent = '';

  // Title
  bodyContent += `
    <w:p>
      <w:pPr><w:pStyle w:val="Title"/></w:pPr>
      <w:r><w:t>${escapeXml(title)}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:pStyle w:val="Subtitle"/></w:pPr>
      <w:r><w:t>Generated: ${escapeXml(now)}</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
  `;

  // Table of Contents hint
  bodyContent += `
    <w:p>
      <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
      <w:r><w:t>Table of Contents</w:t></w:r>
    </w:p>
  `;

  Object.keys(sections).forEach((sectionKey, idx) => {
    const sectionTitle = SECTION_TITLES[sectionKey] || sectionKey;
    bodyContent += `
      <w:p>
        <w:r><w:t>${idx + 1}. ${escapeXml(sectionTitle)}</w:t></w:r>
      </w:p>
    `;
  });

  bodyContent += `<w:p><w:r><w:t></w:t></w:r></w:p>`;

  // Sections
  Object.entries(sections).forEach(([sectionKey, fields], sectionIdx) => {
    const sectionTitle = SECTION_TITLES[sectionKey] || sectionKey;
    
    // Section heading
    bodyContent += `
      <w:p>
        <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
        <w:r><w:t>${sectionIdx + 1}. ${escapeXml(sectionTitle)}</w:t></w:r>
      </w:p>
    `;

    // Fields
    fields.forEach((field: any) => {
      const label = formatFieldLabel(field.field_key);
      const value = field.field_value || 'Not configured';
      const notes = field.notes || '';

      bodyContent += `
        <w:p>
          <w:pPr><w:pStyle w:val="Heading2"/></w:pPr>
          <w:r><w:t>${escapeXml(label)}</w:t></w:r>
        </w:p>
      `;

      if (notes) {
        bodyContent += `
          <w:p>
            <w:r>
              <w:rPr><w:i/><w:color w:val="666666"/></w:rPr>
              <w:t>${escapeXml(notes)}</w:t>
            </w:r>
          </w:p>
        `;
      }

      // Handle multiline values
      const lines = value.split('\n');
      lines.forEach((line: string) => {
        bodyContent += `
          <w:p>
            <w:r><w:t>${escapeXml(line)}</w:t></w:r>
          </w:p>
        `;
      });

      bodyContent += `<w:p><w:r><w:t></w:t></w:r></w:p>`;
    });
  });

  // Footer
  bodyContent += `
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r>
        <w:rPr><w:color w:val="999999"/></w:rPr>
        <w:t>SmartyGym App Vault - Confidential</w:t>
      </w:r>
    </w:p>
  `;

  // Complete DOCX XML structure
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyContent}
  </w:body>
</w:document>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const documentRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:rPr><w:b/><w:sz w:val="56"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle">
    <w:name w:val="Subtitle"/>
    <w:rPr><w:color w:val="666666"/><w:sz w:val="24"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="Heading 1"/>
    <w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="0ea5e9"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="Heading 2"/>
    <w:rPr><w:b/><w:sz w:val="24"/></w:rPr>
  </w:style>
</w:styles>`;

  // Create ZIP structure using simple concatenation (base64)
  // This is a simplified approach - creates a valid but basic DOCX
  const encoder = new TextEncoder();
  
  // We'll use a simpler RTF approach for better compatibility
  return createRtfDocument(title, sections, now);
}

function createRtfDocument(title: string, sections: Record<string, any[]>, date: string): string {
  let rtf = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Arial;}{\\f1 Courier New;}}
{\\colortbl;\\red14\\green165\\blue233;\\red102\\green102\\blue102;\\red0\\green0\\blue0;}
\\paperw12240\\paperh15840\\margl1440\\margr1440\\margt1440\\margb1440
`;

  // Title
  rtf += `\\pard\\qc\\f0\\fs48\\b ${escapeRtf(title)}\\b0\\par
\\fs24\\cf2 Generated: ${escapeRtf(date)}\\cf0\\par
\\par
`;

  // Table of Contents
  rtf += `\\pard\\ql\\fs32\\b\\cf1 Table of Contents\\cf0\\b0\\par
\\fs22
`;

  let tocIdx = 1;
  Object.keys(sections).forEach(sectionKey => {
    const sectionTitle = SECTION_TITLES[sectionKey] || sectionKey;
    rtf += `${tocIdx}. ${escapeRtf(sectionTitle)}\\par
`;
    tocIdx++;
  });

  rtf += `\\par\\par
`;

  // Sections
  let sectionIdx = 1;
  Object.entries(sections).forEach(([sectionKey, fields]) => {
    const sectionTitle = SECTION_TITLES[sectionKey] || sectionKey;
    
    rtf += `\\pard\\ql\\fs32\\b\\cf1 ${sectionIdx}. ${escapeRtf(sectionTitle)}\\cf0\\b0\\par
\\par
`;

    fields.forEach((field: any) => {
      const label = formatFieldLabel(field.field_key);
      const value = field.field_value || 'Not configured';
      const notes = field.notes || '';

      rtf += `\\fs24\\b ${escapeRtf(label)}\\b0\\par
`;

      if (notes) {
        rtf += `\\fs20\\i\\cf2 ${escapeRtf(notes)}\\cf0\\i0\\par
`;
      }

      rtf += `\\fs22 `;
      const lines = value.split('\n');
      lines.forEach((line: string) => {
        rtf += `${escapeRtf(line)}\\line
`;
      });
      rtf += `\\par
`;
    });

    sectionIdx++;
  });

  // Footer
  rtf += `\\par
\\pard\\qc\\fs18\\cf2 SmartyGym App Vault - Confidential\\cf0\\par
}`;

  return rtf;
}

function escapeRtf(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\n/g, '\\line ');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { section } = await req.json();
    console.log(`Generating document for section: ${section || 'all'}`);

    // Fetch vault data
    let query = supabase
      .from('app_vault_data')
      .select('*')
      .order('display_order', { ascending: true });

    if (section && section !== 'all') {
      query = query.eq('section', section);
    }

    const { data: vaultData, error: dbError } = await query;

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    // Group by section
    const sections: Record<string, any[]> = {};
    (vaultData || []).forEach((field: any) => {
      if (!sections[field.section]) {
        sections[field.section] = [];
      }
      sections[field.section].push(field);
    });

    const title = section && section !== 'all' 
      ? `SmartyGym - ${SECTION_TITLES[section] || section}`
      : 'SmartyGym App Vault - Complete Documentation';

    const rtfContent = generateDocxContent(title, sections);
    
    // Convert to base64
    const encoder = new TextEncoder();
    const bytes = encoder.encode(rtfContent);
    const base64 = btoa(String.fromCharCode(...bytes));

    const filename = section && section !== 'all'
      ? `SmartyGym-${section}-${new Date().toISOString().split('T')[0]}.rtf`
      : `SmartyGym-Complete-Vault-${new Date().toISOString().split('T')[0]}.rtf`;

    console.log(`Document generated: ${filename}`);

    return new Response(
      JSON.stringify({ 
        document: base64, 
        filename,
        format: 'rtf'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
