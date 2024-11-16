// 1. Require fs and path modules so we can work with the file system and file/folder directories
const fs = require('fs');
const path = require('path');

// 2. Read JSON file
const groceryList = fs.readFileSync(
	`${path.join(__dirname, 'grocery_list.json')}`,
	'utf-8'
);
// 3. Convert groceryList from JSON to a JavaScript object
const groceryListObj = JSON.parse(groceryList);

// 3. Access 'items' array from groceryList object
const { items } = groceryListObj;

// 4. Create a price list for each item in the items array
const priceList = {
	milk: 1.5,
	eggs: 3.0,
	bread: 2.0,
	apples: 3.5,
	bananas: 2.2,
	tomatoes: 2.8,
	onions: 1.0,
	potatoes: 1.5,
	carrots: 2.0,
	lettuce: 1.8,
	cucumber: 1.2,
	yogurt: 1.5,
	cheese: 3.0,
	coffee: 5.0,
	tea: 4.2,
	pasta: 1.6,
	rice: 2.5
};

// 5. Map over items array and return array of shopping receipts
// 5.1 Next, convert array of shopping receipts to a string body
const shoppingReceipts = items
	.map(
		(item) =>
			`${item.name} - ${item.quantity} ${item.unit} - $${
				priceList[item.name.toLowerCase()] * item.quantity
			}`
	)
	.join('\n');

console.log(shoppingReceipts);

// 6. Calculate total price of all items
const totalPrice = items.reduce(
	(acc, curr) => acc + curr.quantity * priceList[curr.name.toLowerCase()],
	0
);
console.log(totalPrice);

// 7. Create final grocery list
const finalGroceryList = `Grocery List:
--------------------
${shoppingReceipts}
--------------------
Total: $${totalPrice.toFixed(2)}

`;

// 8. Write the final grocery list to 'shopping_receipt.txt'
fs.writeFile(
	`${path.join(__dirname, 'shopping_receipt.txt')}`,
	finalGroceryList,
	'utf-8',
	(err) => {
		if (err) {
			console.log('Failed to write content to file:', err);
		} else {
			console.log('Shopping receipt has been saved successfully.');
		}
	}
);
