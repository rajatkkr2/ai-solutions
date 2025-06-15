const fs = require('fs');
const path = require('path');

const faqPath = path.join(__dirname, '../utility/faq.json');

const readFaqs = () => {
  const data = fs.readFileSync(faqPath, 'utf-8');
  return JSON.parse(data);
};

const writeFaqs = (faqs) => {
  fs.writeFileSync(faqPath, JSON.stringify(faqs, null, 2));
};

module.exports = {
  getAll: () => readFaqs(),

  getById: (id) => {
    const faqs = readFaqs();
    return faqs[id] || null;
  },

  add: (faq) => {
    const faqs = readFaqs();
    faqs.push(faq);
    writeFaqs(faqs);
    return faq;
  },

  update: (id, updatedFaq) => {
    const faqs = readFaqs();
    if (faqs[id]) {
      faqs[id] = updatedFaq;
      writeFaqs(faqs);
      return updatedFaq;
    }
    return null;
  },

  remove: (id) => {
    const faqs = readFaqs();
    if (faqs[id]) {
      const deleted = faqs.splice(id, 1);
      writeFaqs(faqs);
      return deleted[0];
    }
    return null;
  }
};
