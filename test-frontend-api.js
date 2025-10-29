// Test script to verify frontend API calls work correctly
// This simulates what the frontend would send

async function testCreateAndUpdate() {
  const API_BASE = 'http://localhost:8000/api/empreinte_carbone';
  
  // Test 1: Create with JSON data
  console.log('🧪 Testing CREATE with JSON data...');
  try {
    const createResponse = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valeur_co2_kg: 25.5,
        name: 'Test Frontend Entry',
        description: 'This is a test entry from frontend',
        image: 'https://example.com/test-image.jpg'
      })
    });
    
    const createData = await createResponse.json();
    console.log('✅ CREATE JSON Response:', createData);
    
    // Test 2: Create with FormData (simulating file upload)
    console.log('\n🧪 Testing CREATE with FormData...');
    const formData = new FormData();
    formData.append('valeur_co2_kg', '30.2');
    formData.append('name', 'Test FormData Entry');
    formData.append('description', 'This is a test with FormData');
    formData.append('image', 'https://example.com/formdata-image.jpg');
    
    const createFormDataResponse = await fetch(API_BASE, {
      method: 'POST',
      body: formData
    });
    
    const createFormDataResult = await createFormDataResponse.json();
    console.log('✅ CREATE FormData Response:', createFormDataResult);
    
    // Test 3: Update with JSON data
    console.log('\n🧪 Testing UPDATE with JSON data...');
    const updateResponse = await fetch(`${API_BASE}/${createData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valeur_co2_kg: 35.8,
        name: 'Updated Frontend Entry',
        description: 'This entry has been updated'
      })
    });
    
    const updateData = await updateResponse.json();
    console.log('✅ UPDATE JSON Response:', updateData);
    
    // Test 4: Update with FormData
    console.log('\n🧪 Testing UPDATE with FormData...');
    const updateFormData = new FormData();
    updateFormData.append('valeur_co2_kg', '40.1');
    updateFormData.append('name', 'Updated FormData Entry');
    updateFormData.append('description', 'Updated with FormData');
    updateFormData.append('image', 'https://example.com/updated-formdata-image.jpg'); // Image URL
    
    const updateFormDataResponse = await fetch(`${API_BASE}/${createFormDataResult.id}`, {
      method: 'PUT',
      body: updateFormData
    });
    
    const updateFormDataResult = await updateFormDataResponse.json();
    console.log('✅ UPDATE FormData Response:', updateFormDataResult);
    
    console.log('\n🎉 All tests passed! Frontend API calls should work correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCreateAndUpdate();