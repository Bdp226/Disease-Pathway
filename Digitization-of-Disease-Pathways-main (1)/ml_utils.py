import re
from rank_bm25 import BM25Okapi
import math

def compute_urgency(text: str) -> str:
    """
    Computes a heuristic urgency score for a pain point description.
    Returns: 'high', 'medium', or 'low'
    """
    if not text:
        return 'low'
    
    text_lower = text.lower()
    
    high_keywords = [
        r'\bcritical\b', r'\bsevere\b', r'\bdeath\b', r'\bfatal\b', 
        r'\bemergency\b', r'\bexpensive\b', r'\bcrisis\b', r'\bfail(ed|ure|s)?\b',
        r'\black of (awareness|access|resources|treatment|care|funding|support)\b', r'\bno access\b', r'\burgent\b', r'\btoxicity\b'
    ]
    
    medium_keywords = [
        r'\bdelay(s|ed)?\b', r'\bwait\b', r'\bconfus(ing|ion)\b', r'\bunclear\b',
        r'\bdifficult(y)?\b', r'\bhard\b', r'\bfrustrat(ing|ion)\b', r'\bslow\b',
        r'\bbarrier\b', r'\bissue\b', r'\bproblem\b', r'\bburden\b'
    ]
    
    # Check for high urgency
    for pattern in high_keywords:
        if re.search(pattern, text_lower):
            return 'high'
            
    # Check for medium urgency
    for pattern in medium_keywords:
        if re.search(pattern, text_lower):
            return 'medium'
            
    return 'low'

def compute_tags(text: str) -> str:
    """
    Computes a comma-separated list of tags (Medical NER) based on heuristics.
    Returns a string of tags, e.g., '💊 Treatment, 🤒 Symptom'
    """
    if not text:
        return ''
        
    text_lower = text.lower()
    tags_found = set()
    
    # Simple knowledge base of medical entities
    entity_kb = {
        'Treatment': [
            'chemotherapy', 'radiation', 'surgery', 'immunotherapy', 
            'paclitaxel', 'cisplatin', 'drug', 'medication', 'therapy',
            'pill', 'vaccine', 'dose', 'inhaler'
        ],
        'Symptom': [
            'pain', 'nausea', 'fatigue', 'tumor', 'cough', 'fever',
            'headache', 'dizzy', 'bleeding', 'swelling', 'weakness',
            'weight loss', 'shortness of breath', 'lesion'
        ],
        'Clinical': [
            'hospital', 'clinic', 'doctor', 'nurse', 'physician',
            'oncologist', 'specialist', 'mri', 'ct scan', 'x-ray',
            'biopsy', 'diagnosis', 'screening', 'referral', 'icu'
        ],
        'Financial': [
            'cost', 'expensive', 'insurance', 'coverage', 'pay',
            'bill', 'reimbursement', 'out of pocket', 'affordable'
        ]
    }
    
    for tag_name, keywords in entity_kb.items():
        for keyword in keywords:
            if re.search(r'\b' + re.escape(keyword) + r'\b', text_lower):
                tags_found.add(tag_name)
                break # Only need one keyword to assign the tag
                
    return ','.join(sorted(tags_found))


def compute_urgency_breakdown(text: str) -> dict:
    """
    Computes urgency and returns a detailed breakdown of matched keywords.
    """
    if not text:
        return {"score": "low", "matched_keywords": []}
    
    text_lower = text.lower()
    
    high_keywords = [
        r'\bcritical\b', r'\bsevere\b', r'\bdeath\b', r'\bfatal\b', 
        r'\bemergency\b', r'\bexpensive\b', r'\bcrisis\b', r'\bfail(ed|ure|s)?\b',
        r'\black of (awareness|access|resources|treatment|care|funding|support)\b', r'\bno access\b', r'\burgent\b', r'\btoxicity\b'
    ]
    
    medium_keywords = [
        r'\bdelay(s|ed)?\b', r'\bwait\b', r'\bconfus(ing|ion)\b', r'\bunclear\b',
        r'\bdifficult(y)?\b', r'\bhard\b', r'\bfrustrat(ing|ion)\b', r'\bslow\b',
        r'\bbarrier\b', r'\bissue\b', r'\bproblem\b', r'\bburden\b'
    ]
    
    matched_high = []
    for pattern in high_keywords:
        match = re.search(pattern, text_lower)
        if match:
            matched_high.append(match.group(0))
            
    if matched_high:
        return {"score": "high", "matched_keywords": list(set(matched_high))}
        
    matched_medium = []
    for pattern in medium_keywords:
        match = re.search(pattern, text_lower)
        if match:
            matched_medium.append(match.group(0))
            
    if matched_medium:
        return {"score": "medium", "matched_keywords": list(set(matched_medium))}
        
    return {"score": "low", "matched_keywords": []}


def compute_tags_breakdown(text: str) -> dict:
    """
    Computes tags and returns a breakdown mapping tags to the exact entities found.
    """
    if not text:
        return {}
        
    text_lower = text.lower()
    breakdown = {}
    
    # Simple knowledge base of medical entities
    entity_kb = {
        'Treatment': [
            'chemotherapy', 'radiation', 'surgery', 'immunotherapy', 
            'paclitaxel', 'cisplatin', 'drug', 'medication', 'therapy',
            'pill', 'vaccine', 'dose', 'inhaler'
        ],
        'Symptom': [
            'pain', 'nausea', 'fatigue', 'tumor', 'cough', 'fever',
            'headache', 'dizzy', 'bleeding', 'swelling', 'weakness',
            'weight loss', 'shortness of breath', 'lesion'
        ],
        'Clinical': [
            'hospital', 'clinic', 'doctor', 'nurse', 'physician',
            'oncologist', 'specialist', 'mri', 'ct scan', 'x-ray',
            'biopsy', 'diagnosis', 'screening', 'referral', 'icu'
        ],
        'Financial': [
            'cost', 'expensive', 'insurance', 'coverage', 'pay',
            'bill', 'reimbursement', 'out of pocket', 'affordable'
        ]
    }
    
    for tag_name, keywords in entity_kb.items():
        found_for_tag = []
        for keyword in keywords:
            match = re.search(r'\b' + re.escape(keyword) + r'\b', text_lower)
            if match:
                found_for_tag.append(keyword)
        
        if found_for_tag:
            breakdown[tag_name] = list(set(found_for_tag))
            
    return breakdown

from collections import Counter

# ─── MEDICAL TERMINOLOGY WHITELIST ───────────────────────────────────────────
# Similarity is computed ONLY on terms present in this list.
# Non-medical words are completely invisible to the engine.
# Based on clinical domains: genetics, biomarkers, imaging, drugs, comorbidities,
# neurological, cardiovascular, oncological, and metabolic terminology.
MEDICAL_TERMS = {
    # Genetic & Molecular
    'apoe', 'psen1', 'psen2', 'amyloid', 'tau', 'beta', 'plaques', 'neurofibrillary',
    'tangles', 'neurodegeneration', 'neuroinflammation', 'synapse', 'synaptic',
    'dopamine', 'serotonin', 'acetylcholine', 'cholinergic', 'glutamate', 'gaba',
    'lewy', 'prion', 'proteinopathy', 'mitochondria', 'oxidative', 'telomere',
    'mutation', 'polymorphism', 'allele', 'genome', 'epigenetic',

    # Biomarkers & Lab
    'biomarker', 'cerebrospinal', 'csf', 'ldl', 'hdl', 'troponin', 'creatinine',
    'hemoglobin', 'glucose', 'insulin', 'cortisol', 'cytokine', 'interleukin',
    'inflammation', 'c-reactive', 'fibrinogen', 'ferritin', 'albumin', 'bilirubin',
    'cholesterol', 'triglycerides', 'platelet', 'coagulation', 'electrocardiogram',
    'ecg', 'echocardiogram', 'spirometry', 'biopsy', 'histology', 'pathology',
    
    # Neurological Terms
    'cognitive', 'dementia', 'alzheimer', 'parkinson', 'epilepsy', 'seizure',
    'stroke', 'ischemia', 'hypoxia', 'asphyxia', 'atrophy', 'hippocampus',
    'cortex', 'cerebral', 'cerebellar', 'brainstem', 'neuronal', 'axonal',
    'myelin', 'neuropathy', 'encephalopathy', 'delirium', 'depression', 'anxiety',
    'psychosis', 'hallucination', 'delusion', 'aphasia', 'apraxia', 'agnosia',
    'amnesia', 'confusion', 'disorientation', 'malnutrition', 'appetite',
    'behavioral', 'neuropsychiatric', 'sleep', 'insomnia', 'wandering',

    # Cardiovascular Terms
    'coronary', 'atherosclerosis', 'arterial', 'cardiac', 'myocardial', 'infarction',
    'angina', 'arrhythmia', 'fibrillation', 'hypertension', 'hypotension', 'ischemic',
    'plaque', 'stenosis', 'thrombosis', 'embolism', 'heart', 'ventricular',
    'atrial', 'aortic', 'angioplasty', 'stenting', 'bypass', 'statin', 'anticoagulant',
    'aspirin', 'beta-blocker', 'diuretic', 'nitroglycerin', 'thrombolytic',

    # Oncological Terms
    'tumor', 'cancer', 'malignant', 'metastasis', 'oncology', 'carcinoma',
    'sarcoma', 'lymphoma', 'leukemia', 'adenocarcinoma', 'chemotherapy', 'radiation',
    'immunotherapy', 'paclitaxel', 'cisplatin', 'carboplatin', 'bevacizumab',
    'pembrolizumab', 'nivolumab', 'targeted', 'biopsy', 'resection', 'mastectomy',
    'lobectomy', 'pneumonectomy', 'lymphadenectomy', 'staging', 'remission',
    'recurrence', 'prognosis', 'palliative', 'adjuvant', 'neoadjuvant',

    # Imaging & Procedures
    'mri', 'imaging', 'xray', 'ultrasound', 'angiography', 'mammography',
    'endoscopy', 'colonoscopy', 'bronchoscopy', 'lumbar', 'puncture', 'ablation',
    'catheterization', 'stent', 'implant', 'prosthetic', 'dialysis', 'transfusion',
    'transplant', 'intubation', 'ventilator', 'icu', 'surgery', 'invasive',

    # Metabolic & Endocrine
    'diabetes', 'insulin', 'obesity', 'metabolic', 'thyroid', 'adrenal',
    'hypoglycemia', 'hyperglycemia', 'hyperinsulinemia', 'dyslipidemia',
    'adipose', 'visceral', 'fatty', 'liver', 'hepatic', 'renal', 'nephropathy',
    'retinopathy', 'neuropathy', 'microangiopathy', 'macroangiopathy',

    # Pulmonary / Respiratory
    'pulmonary', 'respiratory', 'bronchial', 'alveolar', 'emphysema', 'fibrosis',
    'asthma', 'pneumonia', 'pleural', 'effusion', 'dyspnea', 'hypoxemia', 'cough',
    'sputum', 'inhaler', 'bronchodilator', 'corticosteroid', 'oxygen',

    # Musculoskeletal
    'osteoporosis', 'arthritis', 'rheumatoid', 'fracture', 'sarcopenia',
    'muscle', 'atrophy', 'joint', 'cartilage', 'ligament', 'tendon',

    # Comorbidities & Conditions
    'comorbidity', 'hypertension', 'cardiovascular', 'pneumonia', 'sepsis',
    'infections', 'thromboembolism', 'hemorrhage', 'ulcer', 'anemia',
    'autoimmune', 'immunosuppression', 'transplant',

    # Drug Classes
    'analgesic', 'antibiotic', 'antiviral', 'antifungal', 'antidepressant',
    'antipsychotic', 'anxiolytic', 'sedative', 'antipyretic', 'antihypertensive',
    'vasodilator', 'bronchodilator', 'anticonvulsant', 'immunosuppressant',
    'anticoagulant', 'antiplatelet', 'fibrinolytic', 'diuretic', 'statin',
    'proton', 'inhibitor', 'receptor', 'agonist', 'antagonist',

    # Clinical Outcomes
    'mortality', 'morbidity', 'survival', 'relapse', 'exacerbation', 'complication',
    'adverse', 'toxicity', 'overdose', 'adherence', 'compliance',
}


class SimilarityEngine:
    def __init__(self):
        self.disease_names = []
        self.corpus_vecs = []  # list of Counter — medical terms only
        self.idf = {}

    def _extract_medical_terms(self, text: str) -> list:
        """Return only tokens that exist in the validated MEDICAL_TERMS whitelist."""
        words = re.findall(r'\b[a-z0-9]+(?:-[a-z0-9]+)?\b', text.lower())
        return [w for w in words if w in MEDICAL_TERMS]

    def fit(self, diseases_data):
        self.disease_names = [d['name'] for d in diseases_data]
        self.corpus_vecs = []
        self.idf = {}

        N = len(diseases_data)
        doc_freqs = Counter()

        for d in diseases_data:
            tokens = self._extract_medical_terms(d['text'])
            vec = Counter(tokens)
            self.corpus_vecs.append(vec)
            for term in set(tokens):
                doc_freqs[term] += 1

        # Smoothed IDF
        for term, df in doc_freqs.items():
            self.idf[term] = math.log((N + 1) / (df + 1)) + 1

    def get_similar(self, query_text: str, exclude_name: str, top_k: int = 3):
        if not self.corpus_vecs:
            return []

        query_tokens = self._extract_medical_terms(query_text)
        query_tf = Counter(query_tokens)
        query_tfidf = {term: freq * self.idf.get(term, 1.0) for term, freq in query_tf.items()}

        query_mag = math.sqrt(sum(v ** 2 for v in query_tfidf.values()))
        if query_mag == 0:
            return []

        results = []
        for i, name in enumerate(self.disease_names):
            if name.lower() == exclude_name.lower():
                continue

            doc_tfidf = {term: freq * self.idf.get(term, 1.0) for term, freq in self.corpus_vecs[i].items()}
            doc_mag = math.sqrt(sum(v ** 2 for v in doc_tfidf.values()))
            if doc_mag == 0:
                continue

            # Cosine similarity
            scored_terms = []
            dot = 0.0
            for term, q_val in query_tfidf.items():
                if term in doc_tfidf:
                    weight = q_val * doc_tfidf[term]
                    dot += weight
                    scored_terms.append((term, weight))

            sim = dot / (query_mag * doc_mag)

            # Top terms by TF-IDF contribution
            scored_terms.sort(key=lambda x: x[1], reverse=True)
            top_terms = [x[0] for x in scored_terms[:5]]

            results.append({
                'name': name,
                'similarity': float(sim),
                'overlapping_terms': top_terms
            })

        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:top_k]

# Global instance
similarity_engine = SimilarityEngine()
