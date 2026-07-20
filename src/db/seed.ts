import { db } from "./index";
import { categories, products, productVariants, serviceablePincodes } from "./schema";

async function seed() {
  console.log("Seeding categories...");

  const categoryRows = await db
    .insert(categories)
    .values([
      {
        name: "Podi's (Powders)",
        slug: "podis",
        teluguName: "పొడులు",
        description:
          "Dry spice powders ground fresh in small batches — the everyday flavour boost for rice, idli and dosa.",
        sortOrder: 1,
      },
      {
        name: "Pickles",
        slug: "pickles",
        teluguName: "ఊరగాయలు",
        description:
          "Sun-ripened fruit and vegetable pickles, matured slowly in sesame oil the traditional way.",
        sortOrder: 2,
      },
      {
        name: "Farm Fresh",
        slug: "farm-fresh",
        teluguName: "తాజా పంట",
        description: "Straight from our fields — nothing sits in a warehouse before it reaches you.",
        sortOrder: 3,
      },
      {
        name: "Home Snacks",
        slug: "home-snacks",
        teluguName: "ఇంటి తినుబండారాలు",
        description:
          "Crunchy and sweet snacks made by hand for festivals, evenings, and everything in between.",
        sortOrder: 4,
      },
    ])
    .returning();

  const categoryBySlug = Object.fromEntries(categoryRows.map((c) => [c.slug, c]));

  console.log("Seeding products...");

  const productSeed = [
    {
      categorySlug: "podis",
      name: "Karivepaku (Curry Leaves) Podi",
      slug: "karivepaku-curry-leaves-podi",
      teluguName: "కరివేపాకు పొడి",
      shortDescription: "Aromatic curry leaf powder, home-ground.",
      longDescription:
        "Made from sun-dried curry leaves, roasted lentils and spices, ground fresh in small batches.",
      shelfLife: "6 months",
      spiceLevel: "Medium",
      isVeg: true,
      isFeatured: true,
      variants: [
        { label: "250g", pricePaise: 15000, stockQty: 40 },
        { label: "500g", pricePaise: 28000, stockQty: 25 },
      ],
    },
    {
      categorySlug: "podis",
      name: "Munagaku (Drumstick Leaves) Podi",
      slug: "munagaku-drumstick-leaves-podi",
      teluguName: "మునగాకు పొడి",
      shortDescription: "Nutritious drumstick leaf powder.",
      longDescription:
        "Drumstick leaves are shade-dried and ground with roasted spices for a nutrient-dense everyday podi.",
      shelfLife: "6 months",
      spiceLevel: "Mild",
      isVeg: true,
      isFeatured: false,
      variants: [
        { label: "250g", pricePaise: 16000, stockQty: 30 },
        { label: "500g", pricePaise: 30000, stockQty: 20 },
      ],
    },
    {
      categorySlug: "podis",
      name: "Groundnut Podi",
      slug: "groundnut-podi",
      teluguName: "వేరుశెనగ పొడి",
      shortDescription: "Roasted groundnut chutney powder.",
      longDescription:
        "Farm-fresh groundnuts, dry roasted and ground with garlic and red chillies.",
      shelfLife: "4 months",
      spiceLevel: "Medium",
      isVeg: true,
      isFeatured: true,
      variants: [
        { label: "250g", pricePaise: 14000, stockQty: 50 },
        { label: "500g", pricePaise: 26000, stockQty: 30 },
      ],
    },
    {
      categorySlug: "pickles",
      name: "Mango Pickle",
      slug: "mango-pickle",
      teluguName: "మామిడి ఊరగాయ",
      shortDescription: "Classic raw mango pickle in sesame oil.",
      longDescription:
        "Raw mangoes cut and marinated with red chilli powder, mustard and sesame oil, matured the traditional way.",
      shelfLife: "1 year",
      spiceLevel: "Hot",
      isVeg: true,
      isFeatured: true,
      variants: [
        { label: "250g", pricePaise: 18000, stockQty: 35 },
        { label: "500g", pricePaise: 34000, stockQty: 20 },
        { label: "1kg", pricePaise: 65000, stockQty: 10 },
      ],
    },
    {
      categorySlug: "pickles",
      name: "Tomato Pickle",
      slug: "tomato-pickle",
      teluguName: "టమాటా పచ్చడి",
      shortDescription: "Tangy tomato pickle, everyday favourite.",
      longDescription:
        "Fresh tomatoes cooked down with tempering spices for a tangy, versatile pickle.",
      shelfLife: "3 months",
      spiceLevel: "Medium",
      isVeg: true,
      isFeatured: false,
      variants: [
        { label: "250g", pricePaise: 14000, stockQty: 40 },
        { label: "500g", pricePaise: 26000, stockQty: 25 },
      ],
    },
    {
      categorySlug: "pickles",
      name: "Gongura Pickle",
      slug: "gongura-pickle",
      teluguName: "గోంగూర పచ్చడి",
      shortDescription: "Tangy sorrel leaf pickle, a Telugu classic.",
      longDescription:
        "Gongura leaves cooked with garlic and red chillies for the iconic tangy-spicy Andhra pickle.",
      shelfLife: "3 months",
      spiceLevel: "Hot",
      isVeg: true,
      isFeatured: true,
      variants: [
        { label: "250g", pricePaise: 17000, stockQty: 30 },
        { label: "500g", pricePaise: 32000, stockQty: 18 },
      ],
    },
    {
      categorySlug: "farm-fresh",
      name: "Groundnuts",
      slug: "groundnuts",
      teluguName: "వేరుశెనగలు",
      shortDescription: "Farm-fresh raw groundnuts.",
      longDescription: "Harvested from the family farm, sun-dried and cleaned.",
      shelfLife: "3 months",
      isVeg: true,
      isFeatured: false,
      variants: [
        { label: "500g", pricePaise: 12000, stockQty: 60 },
        { label: "1kg", pricePaise: 22000, stockQty: 40 },
      ],
    },
    {
      categorySlug: "farm-fresh",
      name: "Mangoes",
      slug: "mangoes",
      teluguName: "మామిడి పండ్లు",
      shortDescription: "Seasonal farm-fresh mangoes.",
      longDescription: "Naturally ripened mangoes from the village orchard, available in season.",
      shelfLife: "1 week",
      isVeg: true,
      isFeatured: true,
      variants: [{ label: "1kg", pricePaise: 15000, stockQty: 25 }],
    },
    {
      categorySlug: "home-snacks",
      name: "Jenthikalu",
      slug: "jenthikalu",
      teluguName: "జంతికలు",
      shortDescription: "Crunchy rice-flour spiral snack.",
      longDescription: "A crispy savoury snack made with rice flour, urad dal and sesame seeds.",
      shelfLife: "1 month",
      spiceLevel: "Mild",
      isVeg: true,
      isFeatured: false,
      variants: [
        { label: "250g", pricePaise: 14000, stockQty: 30 },
        { label: "500g", pricePaise: 26000, stockQty: 20 },
      ],
    },
    {
      categorySlug: "home-snacks",
      name: "Laddu",
      slug: "laddu",
      teluguName: "లడ్డు",
      shortDescription: "Home-made sweet laddus.",
      longDescription: "Made with roasted gram flour, ghee and jaggery, rolled by hand.",
      shelfLife: "2 weeks",
      isVeg: true,
      isFeatured: true,
      variants: [
        { label: "250g", pricePaise: 16000, stockQty: 25 },
        { label: "500g", pricePaise: 30000, stockQty: 15 },
      ],
    },
    {
      categorySlug: "home-snacks",
      name: "Chekkalu/Nippatlu",
      slug: "chekkalu-nippatlu",
      teluguName: "చెక్కలు / నిప్పట్లు",
      shortDescription: "Crispy savoury rice crackers.",
      longDescription: "Deep-fried rice flour crackers seasoned with cumin and curry leaves.",
      shelfLife: "1 month",
      spiceLevel: "Mild",
      isVeg: true,
      isFeatured: false,
      variants: [{ label: "250g", pricePaise: 13000, stockQty: 30 }],
    },
    {
      categorySlug: "home-snacks",
      name: "Shenga Unde",
      slug: "shenga-unde",
      teluguName: "శేంగా ఉండ",
      shortDescription: "Groundnut jaggery balls.",
      longDescription: "Roasted groundnuts bound with jaggery syrup, rolled into small balls.",
      shelfLife: "3 weeks",
      isVeg: true,
      isFeatured: false,
      variants: [{ label: "250g", pricePaise: 12000, stockQty: 30 }],
    },
  ];

  for (const p of productSeed) {
    const category = categoryBySlug[p.categorySlug];
    const [product] = await db
      .insert(products)
      .values({
        categoryId: category.id,
        name: p.name,
        slug: p.slug,
        teluguName: p.teluguName,
        shortDescription: p.shortDescription,
        longDescription: p.longDescription,
        shelfLife: p.shelfLife,
        spiceLevel: p.spiceLevel,
        isVeg: p.isVeg,
        isFeatured: p.isFeatured,
        images: [],
      })
      .returning();

    await db.insert(productVariants).values(
      p.variants.map((v, i) => ({
        productId: product.id,
        label: v.label,
        pricePaise: v.pricePaise,
        stockQty: v.stockQty,
        sku: `${p.slug}-${i + 1}`.toUpperCase(),
      })),
    );
  }

  console.log("Seeding serviceable pincodes (Chennai, 600001-600123)...");
  const pincodes = Array.from({ length: 123 }, (_, i) => ({
    pincode: String(600001 + i).padStart(6, "0"),
    city: "Chennai",
  }));
  await db.insert(serviceablePincodes).values(pincodes).onConflictDoNothing();

  console.log("Done.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
