// Test cases for language detection and highlighting functionality
// Run with: deno run --allow-net utils/languageSupport.test.ts

import { detectLanguageFromContent, getLanguageExtension, SupportedLang } from "./languageSupport.ts";

// Test data for different programming languages
const testCases = [
  {
    name: "Empty content",
    content: "",
    expected: "txt"
  },
  {
    name: "Whitespace only",
    content: "   \n\t  ",
    expected: "txt"
  },
  {
    name: "JSON object",
    content: '{"name": "test", "value": 123}',
    expected: "json"
  },
  {
    name: "JSON array",
    content: '[1, 2, 3, "test"]',
    expected: "json"
  },
  {
    name: "Invalid JSON (should not be detected as JSON)",
    content: '{"name": "test", "value": 123,}',
    expected: "general"
  },
  {
    name: "HTML document",
    content: '<!DOCTYPE html><html><head><title>Test</title></head><body><div>Hello</div></body></html>',
    expected: "html"
  },
  {
    name: "HTML fragment",
    content: '<div class="test">Hello <span>World</span></div>',
    expected: "html"
  },
  {
    name: "Java class",
    content: 'public class TestClass {\n    private String name;\n    public static void main(String[] args) {\n        System.out.println("Hello");\n    }\n}',
    expected: "java"
  },
  {
    name: "Java interface",
    content: 'public interface TestInterface {\n    void testMethod();\n}',
    expected: "java"
  },
  {
    name: "C program",
    content: '#include <stdio.h>\nint main() {\n    printf("Hello, World!");\n    return 0;\n}',
    expected: "c"
  },
  {
    name: "C++ program",
    content: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello" << endl;\n    return 0;\n}',
    expected: "cpp"
  },
  {
    name: "C++ with templates",
    content: 'template<typename T>\nclass TestClass {\n    T value;\npublic:\n    TestClass(T v) : value(v) {}\n};',
    expected: "cpp"
  },
  {
    name: "Rust function",
    content: 'fn main() {\n    let mut x = 5;\n    println!("x is {}", x);\n}',
    expected: "rust"
  },
  {
    name: "Rust struct",
    content: 'struct Person {\n    name: String,\n    age: u32,\n}\n\nimpl Person {\n    fn new(name: String, age: u32) -> Self {\n        Person { name, age }\n    }\n}',
    expected: "rust"
  },
  {
    name: "React/TSX component",
    content: 'import React from "react";\n\ninterface Props {\n    name: string;\n}\n\nexport default function TestComponent({ name }: Props) {\n    return <div>Hello {name}</div>;\n}',
    expected: "tsx"
  },
  {
    name: "TSX with hooks",
    content: 'import { useState } from "react";\n\nfunction TestComponent() {\n    const [count, setCount] = useState(0);\n    return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}',
    expected: "tsx"
  },
  {
    name: "CSS styles",
    content: '.test-class {\n    color: #ff0000;\n    font-size: 16px;\n    margin: 10px;\n}',
    expected: "css"
  },
  {
    name: "CSS with media queries",
    content: '@media (max-width: 768px) {\n    .responsive {\n        display: none;\n    }\n}',
    expected: "css"
  },
  {
    name: "Python function",
    content: 'def test_function(name):\n    print(f"Hello {name}")\n    return True',
    expected: "py"
  },
  {
    name: "Python class",
    content: 'class TestClass:\n    def __init__(self, name):\n        self.name = name\n    \n    def greet(self):\n        print(f"Hello {self.name}")',
    expected: "py"
  },
  {
    name: "JavaScript function",
    content: 'function testFunction(name) {\n    console.log(`Hello ${name}`);\n    return true;\n}',
    expected: "js"
  },
  {
    name: "JavaScript with ES6",
    content: 'const testFunction = (name) => {\n    console.log(`Hello ${name}`);\n    return true;\n};',
    expected: "js"
  },
  {
    name: "JavaScript with imports",
    content: 'import { test } from "./test";\nexport default function() {\n    return test();\n}',
    expected: "js"
  },
  {
    name: "General code (should fallback)",
    content: 'if x > 5 then\n    print "x is greater than 5"\nend if',
    expected: "general"
  }
];

// Test language detection
console.log("🧪 Testing Language Detection Functionality");
console.log("=" .repeat(50));

let passedTests = 0;
let totalTests = testCases.length;

for (const testCase of testCases) {
  console.log(`\n📝 Test: ${testCase.name}`);
  console.log(`Content: ${testCase.content.substring(0, 100)}${testCase.content.length > 100 ? '...' : ''}`);
  
  const detected = detectLanguageFromContent(testCase.content);
  const passed = detected === testCase.expected;
  
  console.log(`Expected: ${testCase.expected}`);
  console.log(`Detected: ${detected}`);
  console.log(`Result: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  
  if (passed) {
    passedTests++;
  } else {
    console.log(`❌ Mismatch! Expected ${testCase.expected} but got ${detected}`);
  }
}

console.log("\n" + "=" .repeat(50));
console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

// Test language extension loading
console.log("\n🔧 Testing Language Extension Loading");
console.log("=" .repeat(50));

const testLanguages: SupportedLang[] = ["js", "tsx", "py", "css", "html", "json", "rust", "java", "cpp"];

for (const lang of testLanguages) {
  console.log(`\n📦 Testing ${lang} language extension...`);
  
  try {
    const startTime = performance.now();
    const extension = await getLanguageExtension(lang);
    const loadTime = performance.now() - startTime;
    
    console.log(`✅ ${lang} loaded successfully in ${loadTime.toFixed(2)}ms`);
    console.log(`Extension type: ${typeof extension}`);
    console.log(`Extension length: ${Array.isArray(extension) ? extension.length : 'N/A'}`);
    
    // Test caching
    const startTime2 = performance.now();
    const extension2 = await getLanguageExtension(lang);
    const loadTime2 = performance.now() - startTime2;
    
    console.log(`🔄 Cached load time: ${loadTime2.toFixed(2)}ms`);
    console.log(`Cache working: ${loadTime2 < loadTime ? '✅ Yes' : '❌ No'}`);
    
  } catch (error) {
    console.log(`❌ Failed to load ${lang}: ${error.message}`);
  }
}

// Test edge cases
console.log("\n🚨 Testing Edge Cases");
console.log("=" .repeat(50));

// Test with very long content
const longContent = "console.log('Hello');\n".repeat(1000);
console.log(`\n📏 Testing with long content (${longContent.length} characters)`);
const startTime = performance.now();
const detectedLong = detectLanguageFromContent(longContent);
const longDetectTime = performance.now() - startTime;
console.log(`Detected: ${detectedLong} in ${longDetectTime.toFixed(2)}ms`);

// Test with mixed content
const mixedContent = `
// This is a comment
function test() {
  return "Hello World";
}

<style>
.test { color: red; }
</style>

<script>
console.log("JavaScript here");
</script>
`;
console.log(`\n🔀 Testing with mixed content`);
const detectedMixed = detectLanguageFromContent(mixedContent);
console.log(`Detected: ${detectedMixed}`);

// Test with special characters
const specialChars = 'const test = "Hello\nWorld\tTab"; // Comment with émojis 🚀';
console.log(`\n✨ Testing with special characters`);
const detectedSpecial = detectLanguageFromContent(specialChars);
console.log(`Detected: ${detectedSpecial}`);

console.log("\n🎉 All tests completed!");
console.log("Check the console output above to verify language detection is working correctly.");
