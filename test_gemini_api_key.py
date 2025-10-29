#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test if Gemini API key is valid and working
"""
import google.generativeai as genai
import sys

def test_gemini_api(api_key):
    """Test if the provided Gemini API key is valid"""
    
    print("="*70)
    print("TESTING GEMINI API KEY")
    print("="*70)
    print(f"\nAPI Key: {api_key[:20]}...{api_key[-10:]}")
    print("\nAttempting to configure Gemini API...")
    
    try:
        # Configure the API
        genai.configure(api_key=api_key)
        print("✓ API key configured successfully")
        
        # Try to initialize the model
        print("\nAttempting to initialize Gemini model...")
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        print("✓ Model initialized successfully")
        
        # Try to generate a simple response
        print("\nSending a test message...")
        response = model.generate_content("Say 'Hello, the API is working!' in exactly 5 words.")
        print("✓ Response received successfully")
        
        print("\n" + "="*70)
        print("TEST RESULT: ✅ SUCCESS - API KEY IS VALID AND WORKING!")
        print("="*70)
        print(f"\nTest Response from Gemini:\n{response.text}")
        print("\n" + "="*70)
        
        # Additional info
        print("\nAPI Key Details:")
        print(f"  - Status: ACTIVE ✓")
        print(f"  - Model: gemini-2.0-flash-exp")
        print(f"  - Can generate content: YES ✓")
        print(f"  - Rate limits: Available")
        
        return True
        
    except Exception as e:
        error_message = str(e)
        print("\n" + "="*70)
        print("TEST RESULT: ❌ FAILED - API KEY HAS ISSUES!")
        print("="*70)
        print(f"\nError Details:\n{error_message}")
        print("\n" + "="*70)
        
        # Provide helpful diagnosis
        print("\nPossible Issues:")
        if "API_KEY_INVALID" in error_message or "invalid" in error_message.lower():
            print("  ❌ API Key is INVALID or EXPIRED")
            print("  → You need to generate a new API key from Google AI Studio")
            print("  → Visit: https://aistudio.google.com/app/apikey")
        elif "quota" in error_message.lower() or "limit" in error_message.lower():
            print("  ❌ API Key has reached its QUOTA/RATE LIMIT")
            print("  → Wait for the quota to reset")
            print("  → Or upgrade your API plan")
        elif "permission" in error_message.lower() or "denied" in error_message.lower():
            print("  ❌ API Key lacks necessary PERMISSIONS")
            print("  → Check if Gemini API is enabled in your project")
        else:
            print("  ❌ Unknown error occurred")
            print("  → Check your internet connection")
            print("  → Verify the API key is correct")
        
        return False

if __name__ == "__main__":
    # API key to test
    API_KEY = "AIzaSyCUL3KW_FMEqEWuSzdSd3cHvm8i5ugAmU0"
    
    success = test_gemini_api(API_KEY)
    
    if success:
        print("\n🎉 Your Gemini API key is working perfectly!")
        print("You can continue using it in your application.")
    else:
        print("\n⚠️  Your Gemini API key has problems and needs attention.")
        print("Please get a new API key or check the issues listed above.")
    
    sys.exit(0 if success else 1)


