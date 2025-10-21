import { test, expect } from '@playwright/test';

/**
 * Test suite to detect static/broken buttons across the application
 * Checks for:
 * - Buttons with no text content
 * - Buttons with zero dimensions
 * - Buttons that are not visible
 * - Buttons with empty aria-labels
 */

test.describe('Static Button Detection', () => {
  const routes = [
    { path: '/', name: 'Homepage' },
    { path: '/about', name: 'About' },
    { path: '/features', name: 'Features' },
    { path: '/contact', name: 'Contact' },
    { path: '/onboarding-demo', name: 'Onboarding Demo' },
  ];

  for (const route of routes) {
    test(`should have no static buttons on ${route.name}`, async ({ page }) => {
      // Navigate to the route
      await page.goto(route.path);
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      // Find all buttons and button-like elements
      const buttons = await page.locator('button, [role="button"], input[type="button"], input[type="submit"]').all();
      
      console.log(`\n📊 ${route.name} (${route.path}): Found ${buttons.length} button elements`);
      
      const issues: string[] = [];
      
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        
        // Get button properties
        const isVisible = await button.isVisible();
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const title = await button.getAttribute('title');
        const boundingBox = await button.boundingBox();
        const className = await button.getAttribute('class');
        const id = await button.getAttribute('id');
        const dataTestId = await button.getAttribute('data-testid');
        
        // Identify the button
        const identifier = dataTestId || id || className?.split(' ')[0] || `button-${i}`;
        
        // Check for issues
        if (isVisible) {
          // Check if button has no visible text
          const trimmedText = text?.trim() || '';
          if (!trimmedText && !ariaLabel && !title) {
            issues.push(`❌ Button "${identifier}" has no text, aria-label, or title`);
          }
          
          // Check if button has zero dimensions (likely hidden or broken CSS)
          if (boundingBox && (boundingBox.width === 0 || boundingBox.height === 0)) {
            issues.push(`⚠️  Button "${identifier}" has zero dimensions (${boundingBox.width}x${boundingBox.height})`);
          }
          
          // Check if button text is just whitespace or special characters
          if (trimmedText && /^[\s\u200B-\u200D\uFEFF]+$/.test(trimmedText)) {
            issues.push(`❌ Button "${identifier}" has only whitespace text`);
          }
          
          // Check for common styling issues
          const styles = await button.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize,
              display: computed.display,
            };
          });
          
          // Check if text color matches background (invisible text)
          if (styles.color === styles.backgroundColor) {
            issues.push(`⚠️  Button "${identifier}" has matching text and background color`);
          }
          
          // Log visible button info
          console.log(`  ✓ Button "${identifier}": "${trimmedText || ariaLabel || title || '(icon only)'}" (${boundingBox?.width?.toFixed(0)}x${boundingBox?.height?.toFixed(0)}px)`);
        }
      }
      
      // Report issues
      if (issues.length > 0) {
        console.log(`\n🚨 Issues found on ${route.name}:`);
        issues.forEach(issue => console.log(`  ${issue}`));
        
        // Take screenshot for debugging
        await page.screenshot({ 
          path: `test-results/button-issues-${route.name.toLowerCase().replace(/\s+/g, '-')}.png`,
          fullPage: true 
        });
        
        // Fail the test with detailed message
        expect(issues.length, `Found ${issues.length} button issues:\n${issues.join('\n')}`).toBe(0);
      } else {
        console.log(`  ✅ All buttons are properly configured`);
      }
    });
  }
  
  test('should check learner app subject cards for button issues', async ({ page }) => {
    // This would be for learner-app, skipping if not available
    test.skip(!process.env.LEARNER_APP_URL, 'Learner app URL not configured');
    
    const learnerAppUrl = process.env.LEARNER_APP_URL || 'http://localhost:3003';
    
    try {
      await page.goto(`${learnerAppUrl}/subjects`);
      await page.waitForLoadState('networkidle');
      
      // Check subject card buttons specifically
      const subjectCards = await page.locator('[data-testid^="subject-card"]').all();
      console.log(`\n📊 Found ${subjectCards.length} subject cards`);
      
      const issues: string[] = [];
      
      for (const card of subjectCards) {
        const buttons = await card.locator('button').all();
        
        for (const button of buttons) {
          const text = await button.textContent();
          const isVisible = await button.isVisible();
          
          if (isVisible && (!text || text.trim() === '')) {
            const className = await button.getAttribute('class');
            issues.push(`❌ Subject card button with no text: ${className}`);
          }
        }
      }
      
      if (issues.length > 0) {
        console.log('🚨 Subject card button issues:');
        issues.forEach(issue => console.log(`  ${issue}`));
        
        await page.screenshot({ 
          path: 'test-results/subject-card-button-issues.png',
          fullPage: true 
        });
        
        expect(issues.length, `Found ${issues.length} subject card button issues`).toBe(0);
      } else {
        console.log('  ✅ All subject card buttons have text');
      }
    } catch (error) {
      console.log('⚠️  Could not access learner app:', error);
    }
  });
  
  test('should generate button inventory report', async ({ page }) => {
    const inventory: any = {
      timestamp: new Date().toISOString(),
      routes: {},
      summary: {
        totalButtons: 0,
        totalRoutes: 0,
        issuesFound: 0,
      }
    };
    
    for (const route of routes) {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      
      const buttons = await page.locator('button, [role="button"]').all();
      
      const buttonData = [];
      
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const isVisible = await button.isVisible();
        
        if (isVisible) {
          const text = await button.textContent();
          const ariaLabel = await button.getAttribute('aria-label');
          const dataTestId = await button.getAttribute('data-testid');
          const className = await button.getAttribute('class');
          const boundingBox = await button.boundingBox();
          
          buttonData.push({
            index: i,
            text: text?.trim(),
            ariaLabel,
            dataTestId,
            className: className?.split(' ').slice(0, 3).join(' '),
            dimensions: boundingBox ? `${boundingBox.width.toFixed(0)}x${boundingBox.height.toFixed(0)}` : 'unknown',
            hasIssue: !text?.trim() && !ariaLabel,
          });
          
          if (!text?.trim() && !ariaLabel) {
            inventory.summary.issuesFound++;
          }
        }
      }
      
      inventory.routes[route.path] = {
        name: route.name,
        buttonCount: buttonData.length,
        buttons: buttonData,
      };
      
      inventory.summary.totalButtons += buttonData.length;
    }
    
    inventory.summary.totalRoutes = routes.length;
    
    // Write inventory to file
    const fs = require('fs');
    fs.writeFileSync(
      'test-results/button-inventory.json',
      JSON.stringify(inventory, null, 2)
    );
    
    console.log('\n📋 Button Inventory Report Generated');
    console.log(`   Total Routes: ${inventory.summary.totalRoutes}`);
    console.log(`   Total Buttons: ${inventory.summary.totalButtons}`);
    console.log(`   Issues Found: ${inventory.summary.issuesFound}`);
    console.log(`   Report: test-results/button-inventory.json`);
  });
});
