
const classifyComplaint = async (description, category) => {
  let department = 'General Administration';
  let priority = 'Medium';

  const departmentKeywords = {
    'Public Works Department': ['road', 'pothole', 'street light', 'sidewalk'],
    'Water Department': ['water', 'pipe', 'leak', 'sewage'],
    'Sanitation Department': ['garbage', 'waste', 'dumpster', 'clean'],
    'Electricity Board': ['electricity', 'power', 'outage', 'transformer'],
    'Health Department': ['health', 'hygiene', 'hospital', 'clinic'],
    'Urban Planning Department': ['planning', 'zoning', 'construction'],
  };

  const priorityKeywords = {
    High: ['urgent', 'emergency', 'danger', 'fire'],
    Low: ['minor', 'suggestion', 'request'],
  };

  const text = `${description.toLowerCase()} ${category.toLowerCase()}`;

  for (const [dept, keywords] of Object.entries(departmentKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      department = dept;
      break;
    }
  }

  for (const [prio, keywords] of Object.entries(priorityKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      priority = prio;
      break;
    }
  }

  return { department, priority };
};

module.exports = classifyComplaint;

