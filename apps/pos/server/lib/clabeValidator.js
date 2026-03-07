/**
 * CLABE Validator
 * Validates Mexican CLABE (Clave Bancaria Estandarizada) numbers.
 * 18-digit standardized bank account number used for SPEI transfers.
 */

// Mexican bank codes
const BANK_CODES = {
  '002': 'BANAMEX',
  '006': 'BANCOMEXT',
  '009': 'BANOBRAS',
  '012': 'BBVA',
  '014': 'SANTANDER',
  '021': 'HSBC',
  '030': 'BAJIO',
  '032': 'IXE',
  '036': 'INBURSA',
  '037': 'INTERACCIONES',
  '042': 'MIFEL',
  '044': 'SCOTIABANK',
  '058': 'BANREGIO',
  '059': 'INVEX',
  '060': 'BANSI',
  '062': 'AFIRME',
  '072': 'BANORTE',
  '102': 'ABN AMRO',
  '103': 'AMERICAN EXPRESS',
  '106': 'BAMSA',
  '108': 'TOKYO',
  '110': 'JP MORGAN',
  '112': 'BMONEX',
  '113': 'VE POR MAS',
  '116': 'ING',
  '124': 'DEUTSCHE',
  '126': 'CREDIT SUISSE',
  '127': 'AZTECA',
  '128': 'AUTOFIN',
  '129': 'BARCLAYS',
  '130': 'COMPARTAMOS',
  '131': 'BANCO FAMSA',
  '132': 'MULTIVA',
  '133': 'ACTINVER',
  '134': 'WAL-MART',
  '135': 'NAFIN',
  '136': 'INTERCAM',
  '137': 'BANCOPPEL',
  '138': 'ABC CAPITAL',
  '139': 'UBS',
  '140': 'CONSUBANCO',
  '141': 'VOLKSWAGEN',
  '143': 'CIBANCO',
  '145': 'BBASE',
  '147': 'BANKAOOL',
  '148': 'PAGATODO',
  '149': 'INMOBILIARIO MEXICANO',
  '150': 'NU MEXICO',
  '155': 'ICBC',
  '156': 'SABADELL',
  '166': 'BANCO S3',
  '168': 'HIPOTECARIA FEDERAL',
  '600': 'MONEXCB',
  '601': 'GBM',
  '602': 'MASARI',
  '605': 'VALUE',
  '606': 'ESTRUCTURADORES',
  '607': 'TIBER',
  '608': 'VECTOR',
  '610': 'B&B',
  '614': 'ACCIVAL',
  '616': 'MERRILL LYNCH',
  '617': 'VALMEX',
  '618': 'UNICA',
  '619': 'MAPFRE',
  '620': 'PROFUTURO',
  '621': 'CB ACTINVER',
  '622': 'OACTIN',
  '623': 'CBURSA',
  '626': 'CBDEUTSCHE',
  '627': 'ZURICH',
  '628': 'ZURICHVI',
  '629': 'SU CASITA',
  '630': 'CB INTERCAM',
  '631': 'CI BOLSA',
  '632': 'BULLTICK CB',
  '633': 'STERLING',
  '634': 'FINCOMUN',
  '636': 'HDI SEGUROS',
  '637': 'ORDER',
  '638': 'AKALA',
  '640': 'CB JPMORGAN',
  '642': 'REFORMA',
  '646': 'STP',
  '648': 'EVERCORE',
  '649': 'SKANDIA',
  '651': 'SEGMTY',
  '652': 'ASEA',
  '653': 'KUSPIT',
  '655': 'SOFIEXPRESS',
  '656': 'UNAGRA',
  '659': 'OPCIONES EMPRESARIALES',
  '670': 'LIBERTAD',
  '674': 'CAJA TELEFONISTAS',
  '680': 'CRISTOBAL COLON',
  '683': 'CAJA POP MEXICANA',
  '684': 'TRANSFER',
  '685': 'FONDO (FIRA)',
  '686': 'INVERCAP',
  '689': 'FOMPED',
  '699': 'FONDEADORA',
  '706': 'ARCUS',
  '710': 'NVIO',
  '722': 'MERCADOPAGO',
  '723': 'CUENCA',
  '812': 'BBVA BANCOMER SA2',
  '846': 'STP2',
  '901': 'CLS',
  '902': 'INDEVAL',
  '999': 'N/A',
};

// Weights for CLABE modulus-10 check digit
const WEIGHTS = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];

/**
 * Validate a CLABE number.
 * @param {string} clabe - The CLABE to validate
 * @returns {{ valid: boolean, bankCode?: string, bankName?: string, error?: string }}
 */
export function validateCLABE(clabe) {
  if (!clabe || typeof clabe !== 'string') {
    return { valid: false, error: 'CLABE is required' };
  }

  // Remove spaces
  const cleaned = clabe.replace(/\s/g, '');

  // Must be exactly 18 digits
  if (!/^\d{18}$/.test(cleaned)) {
    return { valid: false, error: 'CLABE must be exactly 18 digits' };
  }

  // Extract bank code (first 3 digits)
  const bankCode = cleaned.substring(0, 3);
  const bankName = BANK_CODES[bankCode];

  if (!bankName) {
    return { valid: false, error: `Unknown bank code: ${bankCode}` };
  }

  // Modulus-10 check digit validation
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += (parseInt(cleaned[i], 10) * WEIGHTS[i]) % 10;
  }
  const expectedCheckDigit = (10 - (sum % 10)) % 10;
  const actualCheckDigit = parseInt(cleaned[17], 10);

  if (expectedCheckDigit !== actualCheckDigit) {
    return { valid: false, error: 'Invalid CLABE check digit' };
  }

  return {
    valid: true,
    bankCode,
    bankName,
  };
}

export { BANK_CODES };
