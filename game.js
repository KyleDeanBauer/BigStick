document.addEventListener('DOMContentLoaded', (event) => {
  let gameStarted = false; // Flag to track if the game has started
  
  function startGame() {
    const gameArea = document.getElementById('game-area');
    const stickMan = document.getElementById('stick-man');
    let stickLength = 100; // Initial length of the stick
    let enemies = []; // To keep track of all enemies
    let collisionCount = 0; // Initialize collision counter
    let rotation = 0; // Initial rotation angle
    let spawningIntervals = [];

    document.addEventListener('keydown', (event) => {
      const key = event.key;
      switch (key) {
        case 'ArrowLeft':
          if (stickLength < 300) {
            rotation -= 7; // Rotate counterclockwise
          } else {
            rotation -= 3; // Rotate counterclockwise with a smaller step
          }
          break;
        case 'ArrowRight':
          if (stickLength < 300) {
            rotation += 7; // Rotate clockwise
          } else {
            rotation += 3; // Rotate clockwise with a smaller step 
          }
          break;
      }
      stickMan.style.transform = `rotate(${rotation}deg)`;
    });

    function checkGameOver() {
      if (stickLength <= 0) { 
        const gameOverElement = document.createElement('div');
        gameOverElement.textContent = 'GAME OVER';
        gameOverElement.className = 'game-over-flash'
        gameOverElement.style.position = 'absolute';
        gameOverElement.style.top = '50%';
        gameOverElement.style.left = '50%';
        gameOverElement.style.transform = 'translate(-50%, -50%)';
        gameOverElement.style.fontSize = '2rem';
        gameOverElement.style.color = 'red';
        
        spawningIntervals.forEach(intervalId => clearInterval(intervalId));
        // Clear game area
        clearGameArea();
        
        document.getElementById('game-area').appendChild(gameOverElement);
      }
    }
        
    function updateCollisionCounter() {
      document.getElementById('collision-counter').textContent = `STICKNESS: ${collisionCount}`;
    }
    
    function updateStickLengthDisplay() {
      document.getElementById('stick-length-display').textContent = `BIGNESS: ${stickLength}`;
    }
  
    function checkForCollision() {
      const stickManRect = stickMan.getBoundingClientRect();
      
      enemies.forEach((enemy, index) => {
        const enemyRect = enemy.element.getBoundingClientRect();
        if (!(stickManRect.right < enemyRect.left || 
              stickManRect.left > enemyRect.right || 
              stickManRect.bottom < enemyRect.top || 
              stickManRect.top > enemyRect.bottom)) {
          // Collision detected
          if (enemy.element.classList.contains('special-enemy')) {
            // special enemy, decrease stick length
            stickLength -= 70;
            updateStickLengthDisplay();
            checkGameOver();
            // boss enemy, massive blow!
          } else if (enemy.element.classList.contains('boss-enemy')) {
            stickLength -= 270;
            updateStickLengthDisplay();
            checkGameOver();
          } else {
            // regular enemies, increase stick length
            stickLength += 20; 
            updateStickLengthDisplay();
          }
          stickMan.style.height = `${stickLength}px`; // Adjust the stick height
          enemy.element.remove();
          enemies.splice(index, 1);
          collisionCount++;
          updateCollisionCounter();
          if (collisionCount % 6 === 0 && collisionCount !== 0) { // goblin spawn at multiples of 6 collisions
            spawnSpecialEnemy();
          }
          if (collisionCount % 33 === 0 && collisionCount !== 0) { // boss spawn at multiples of 33 collisions
            spawnBossEnemy();
          }
        }
      });
    }

    function spawnEnemy() {
      const enemy = document.createElement('div');
      enemy.classList.add('enemy');
      const initialTop = Math.random() * (gameArea.offsetHeight - 20);
      enemy.style.top = `${initialTop}px`;
      enemy.style.right = '0px';
      gameArea.appendChild(enemy);
      enemies.push({ element: enemy, top: initialTop });
      moveEnemy(enemy);
    }

    function moveEnemy(enemy) {
      let interval = setInterval(() => {
        const currentRight = parseInt(enemy.style.right, 10);
        const enemyRect = enemy.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();
        // Calculate the center position of the game area
        const gameAreaCenterY = gameAreaRect.top + (gameAreaRect.height / 2);
        // Determine vertical direction towards the center
        const verticalDirection = enemyRect.top + (enemyRect.height / 2) < gameAreaCenterY ? 1 : -1;
        // Move enemy horizontally towards the left
        enemy.style.right = `${currentRight + 5}px`;
          // Move enemy vertically towards the center, adjusting the 'top' style
        const currentTop = parseInt(enemy.style.top, 10);
        enemy.style.top = `${currentTop + verticalDirection * 2}px`; 
    
        checkForCollision();
    
        if (currentRight > gameArea.offsetWidth) {
          enemy.remove();
          clearInterval(interval);
        }
      }, 50);
    }
    
    function spawnAdditionalEnemy() {
      const enemy = document.createElement('div');
      enemy.classList.add('enemy');
      const verticalPosition = Math.random() < 0.5 ? 'top' : 'bottom';
      const horizontalPosition = Math.random() * (gameArea.offsetHeight - 20);
      enemy.style[verticalPosition] = '0px';
      enemy.style.left = `${horizontalPosition}px`;
      gameArea.appendChild(enemy);
      enemies.push({ element: enemy, left: horizontalPosition });
      moveEnemyVertically(enemy, verticalPosition);
    }

    function moveEnemyVertically(enemy, verticalPosition) {
      let interval = setInterval(() => {
        const currentTop = parseInt(enemy.style.top, 10);
        const enemyRect = enemy.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();
        // Calculate the center position of the game area
        const gameAreaCenterX = gameAreaRect.left + (gameAreaRect.width / 2);
        // Determine horizontal direction towards the center
        const horizontalDirection = enemyRect.left + (enemyRect.width / 2) < gameAreaCenterX ? 1 : -1;
        // Move enemy vertically based on its spawn position
        const moveAmount = verticalPosition === 'top' ? 5 : -5;
        enemy.style.top = `${currentTop + moveAmount}px`;
        // Move enemy horizontally towards the center, adjusting the 'left' or 'right' style
        const currentLeft = parseInt(enemy.style.left, 10);
        enemy.style.left = `${currentLeft + horizontalDirection * 2}px`; 
    
        checkForCollision();
    
        if (currentTop > gameArea.offsetHeight || currentTop < -20) {
          enemy.remove();
          clearInterval(interval);
        }
      }, 50);
    }
    
    function spawnSpecialEnemy() {
      const enemy = document.createElement('div');
      enemy.classList.add('special-enemy');
      enemy.style.top = '0px';
      gameArea.appendChild(enemy);
      enemies.push({ element: enemy }); // Add special enemy to the tracking array
      moveSpecialEnemy(enemy);
    }

    function moveSpecialEnemy(enemy) {
      let moveRight = true;
      let moveDown = true;
      let currentTop = parseInt(enemy.style.top, 10);
      let currentLeft = parseInt(enemy.style.left || '0', 10);

      const zigzagMovement = () => {
        const gameAreaWidth = gameArea.offsetWidth;
        const gameAreaHeight = gameArea.offsetHeight;
        const horizontalSpeed = 5;
        const verticalSpeed = 3;
        if (moveRight) {
          if (currentLeft + horizontalSpeed < gameAreaWidth - enemy.offsetWidth) {
            currentLeft += horizontalSpeed;
          } else {
            moveRight = false;
          }
        } else {
          if (currentLeft - horizontalSpeed > 0) {
            currentLeft -= horizontalSpeed;
          } else {
            moveRight = true;
          }
        }
        if (moveDown) {
          if (currentTop + verticalSpeed < gameAreaHeight - enemy.offsetHeight) {
            currentTop += verticalSpeed;
          } else {
            moveDown = false;
          }
        } else {
          if (currentTop - verticalSpeed > 0) {
            currentTop -= verticalSpeed;
          } else {
            moveDown = true;
          }
        }
        enemy.style.left = `${currentLeft}px`;
        enemy.style.top = `${currentTop}px`;
        checkForCollision();
      };

      const movementInterval = setInterval(zigzagMovement, 50);
      enemy.addEventListener('remove', () => clearInterval(movementInterval));
    }

    function spawnBossEnemy() {
      const bossEnemy = document.createElement('div');
      bossEnemy.classList.add('boss-enemy'); 
      bossEnemy.style.top = '0px';
      bossEnemy.style.left = '50%'; // Positioning the boss at the top and center
      gameArea.appendChild(bossEnemy);
      enemies.push({ element: bossEnemy }); // Add boss enemy to the tracking array
      moveBossEnemy(bossEnemy);
    }

    function moveBossEnemy(bossEnemy) {
      let verticalDirection = 1; // 1 for down, -1 for up
      let horizontalDirection = 1; // 1 for right, -1 for left
      const verticalSpeed = 5; // Speed of vertical movement
      const horizontalSpeed = 10; // Speed of horizontal movement
      let slamDown = false; // Flag to control slamming down and up behavior
      const slamSpeed = gameArea.offsetHeight; // Speed to slam down and up instantly
      
      const moveInterval = setInterval(() => {
        let currentTop = parseInt(bossEnemy.style.top, 10);
        let currentLeft = parseInt(bossEnemy.style.left, 10);
    
        // Handle slam down and up behavior
        if (slamDown) {
          bossEnemy.style.top = `${gameArea.offsetHeight - bossEnemy.offsetHeight}px`; // Slam to bottom
          setTimeout(() => {
            bossEnemy.style.top = `0px`; // Instantly move back up
            slamDown = false; // Reset slam behavior flag
          }, 100); // Short delay before moving back up
        } else {
          // Regular vertical movement
          if (currentTop >= gameArea.offsetHeight - bossEnemy.offsetHeight || currentTop <= 0) {
            verticalDirection *= -1; // Change vertical direction at top or bottom
          }
          bossEnemy.style.top = `${currentTop + (verticalSpeed * verticalDirection)}px`;
    
          // Horizontal movement
          if (currentLeft >= gameArea.offsetWidth - bossEnemy.offsetWidth && horizontalDirection === 1) {
            horizontalDirection = -1; // Change to move left when reaching the right edge
          } else if (currentLeft <= 0 && horizontalDirection === -1) {
            horizontalDirection = 1; // Change to move right when reaching the left edge
          }
          bossEnemy.style.left = `${currentLeft + (horizontalSpeed * horizontalDirection)}px`;
        }
    
        checkForCollision(); // Check for collision with stick man
      }, 100);
    
      // Trigger slam down behavior every 6 seconds
      setInterval(() => {
        slamDown = true;
      }, 6000);
    
      bossEnemy.addEventListener('remove', () => clearInterval(moveInterval)); // Clear interval when boss is removed
    }

    function clearGameArea() {
      enemies.forEach(enemy => {
        enemy.element.remove(); // Remove enemy from DOM
      });
      enemies = []; // Clear the enemies array

      const stickMan = document.getElementById('stick-man');
      if (stickMan) {
      stickMan.remove();
      }
    }
    
    spawningIntervals.push(setInterval(() => {
      spawnEnemy();
      spawnEnemy();
      spawnAdditionalEnemy();
    }, 2000
    ));
  }

  document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && !gameStarted) {
      document.getElementById('splashScreen').style.display = 'none';
      gameStarted = true; // Set the flag to true, allowing the game to start
      startGame();
    } 
  });
});

// Bauer,Kyle & CHATGPT4
