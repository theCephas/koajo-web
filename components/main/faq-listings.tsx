"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { faqsData } from "@/data/faq";
import { useState, useMemo } from "react";
import Image from "next/image";
import cn from "clsx";

export default function FaqListings() {
  const categories = useMemo(
    () => faqsData.map((item) => item.category).sort(),
    []
  ); // sort alphabetically
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categories[0]);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  // Filter data based on search query and selected category
  const filteredData = useMemo(() => {
    let filtered = faqsData;

    // Filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter(
        (category) =>
          category.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered
        .map((category) => ({
          ...category,
          items: category.items.filter(
            (item) =>
              item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((category) => category.items.length > 0);
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-primary/20 text-primary font-medium">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <section className="w-full bg-gray py-7.5 md:py-20 lg:py-30">
      <div className="page_container">
        {/* Search Bar */}
        <div className="flex items-center justify-between w-full px-5 md:px-6 py-4.5 md:py-5 gap-2.5 md:gap-3 rounded-xl bg-white mb-5 md:mb-7.5 border border-text-200 focus:border-primary">
          <div className="shrink-0 flex  items-center pointer-events-none">
            <Image
              src="/media/icons/search.svg"
              alt="search"
              width={21}
              height={21}
              className="size-5 md:size-6 object-contain"
            />
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm md:text-base text-text-400 placeholder-secondary-300 focus:outline-none"
          />
        </div>

        {/* Category Filters */}
          <div className="w-full flex flex-wrap gap-2 md:gap-4 md:justify-center mb-7.5">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category ? null : category
                  )
                }
                className={cn(
                  "px-6 py-2 md:py-3 rounded-xl md:rounded-[0.875rem] text-sm md:text-base font-medium transition-colors border border-text-200 cursor-pointer",
                  selectedCategory === category
                    ? "bg-primary text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                )}
              >
                {category}
              </button>
            ))} 
           </div>

        {/* FAQ Items */}
        <div className="w-full space-y-5">
          {filteredData.map((category) => (
            <div key={category.category}>
              {filteredData.length > 1 && (
                <h3 className="text-md font-semibold text-gray-900 mb-3">
                  {category.category}
                </h3>
              )}
              <Accordion.Root 
                type="single" 
                collapsible 
                className="space-y-3"
                value={Array.from(openItems)[0] || ""}
                onValueChange={(value) => {
                  if (value) {
                    setOpenItems(new Set([value]));
                  } else {
                    setOpenItems(new Set());
                  }
                }}
              >
                {category.items.map((item, index) => {
                  const itemId = `${category.category}-${index}`;

                  return (
                    <Accordion.Item
                      key={itemId}
                      value={itemId}
                      className="bg-white rounded-[0.875rem] px-4 py-5 hover:shadow-sm transition-shadow"
                    >
                      <Accordion.Trigger asChild>
                        <button className="w-full text-left cursor-pointer">
                          <div className="flex justify-between">
                            <h4 className="text-md md:text-lg font-medium text-gray-900 pr-4">
                              {highlightText(item.question, searchQuery)}
                            </h4>
                            <div className="flex items-center justify-center flex-shrink-0 size-4 md:size-8 rounded-full shadow-[0_0.9px_3.6px_0_rgba(17,17,17,0.08),_0_0.9px_1.8px_-0.9px_rgba(17,17,17,0.10)]">
                              {openItems.has(itemId) ? (
                                <Image
                                  src="/media/icons/minus.svg"
                                  alt="minus"
                                  width={17}
                                  height={17}
                                  className="size-auto object-contain"
                                />
                              ) : (
                                <Image
                                  src="/media/icons/plus.svg"
                                  alt="plus"
                                  width={17}
                                  height={17}
                                  className="size-auto object-contain"
                                />
                              )}
                            </div>
                          </div>
                        </button>
                      </Accordion.Trigger>

                      <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                          <p className="text-text-500 text-sm md:text-base pt-2 md:pt-3">
                            {highlightText(item.answer, searchQuery)}
                          </p>
                      </Accordion.Content>
                    </Accordion.Item>
                  );
                })}
              </Accordion.Root>
            </div>
          ))}

          {filteredData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No questions found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
